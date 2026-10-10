import type { TimedEvent } from "./build-day-events";

export interface LaidOutEvent extends TimedEvent {
  /** Cột trong nhóm overlap (0-indexed). */
  column: number;
  /** Tổng số cột của nhóm overlap chứa event này. */
  columnCount: number;
}

interface Cluster {
  /** Phút kết thúc lớn nhất của cluster (để quyết định event mới có cùng cluster không). */
  endMinutes: number;
  /** endMinutes của mỗi cột (để biết cột nào còn trống). */
  columnEnds: number[];
}

/**
 * Thuật toán xếp cột cho các sự kiện cùng khung giờ (kiểu Google Calendar).
 * - Sắp xếp theo startMinutes, duration dài trước.
 * - Duy trì một mảng "clusters": mỗi cluster là nhóm các event overlap lẫn nhau.
 * - Trong cluster: gán mỗi event vào cột trống đầu tiên; nếu hết cột → mở rộng.
 * - Sau khi đã biết số cột tối đa của cluster, set columnCount cho mọi event
 *   trong cluster đó.
 *
 * Kết quả: width = 100/columnCount%, left = (column/columnCount)*100%.
 */
export function layoutTimelineEvents(events: TimedEvent[]): LaidOutEvent[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) {
      return a.startMinutes - b.startMinutes;
    }

    const aDuration = a.endMinutes - a.startMinutes;
    const bDuration = b.endMinutes - b.startMinutes;

    return bDuration - aDuration;
  });

  type EventWithCluster = TimedEvent & { column: number; cluster: Cluster };

  const built: EventWithCluster[] = [];
  let activeCluster: Cluster | null = null;

  for (const event of sorted) {
    const start = event.startMinutes;

    // Nếu cluster hiện tại đã "đóng" (event mới bắt đầu sau khi cluster kết thúc)
    // thì mở cluster mới.
    if (!activeCluster || start >= activeCluster.endMinutes) {
      activeCluster = { endMinutes: event.endMinutes, columnEnds: [event.endMinutes] };
      built.push({ ...event, column: 0, cluster: activeCluster });

      continue;
    }

    // Tìm cột trống đầu tiên (cột có endMinutes <= start).
    let columnIndex = activeCluster.columnEnds.findIndex((end) => end <= start);

    if (columnIndex === -1) {
      columnIndex = activeCluster.columnEnds.length;
      activeCluster.columnEnds.push(event.endMinutes);
    } else {
      activeCluster.columnEnds[columnIndex] = event.endMinutes;
    }

    if (event.endMinutes > activeCluster.endMinutes) {
      activeCluster.endMinutes = event.endMinutes;
    }

    built.push({ ...event, column: columnIndex, cluster: activeCluster });
  }

  // Gom event theo cluster để tính columnCount.
  const columnCountByCluster = new Map<Cluster, number>();
  for (const item of built) {
    const cluster = item.cluster;
    const current = columnCountByCluster.get(cluster) ?? 0;

    if (cluster.columnEnds.length > current) {
      columnCountByCluster.set(cluster, cluster.columnEnds.length);
    }
  }

  return built.map(({ cluster: _cluster, ...rest }) => ({
    ...rest,
    columnCount: columnCountByCluster.get(_cluster) ?? 1,
  }));
}
