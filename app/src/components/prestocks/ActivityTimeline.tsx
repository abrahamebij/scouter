import { ResearchEvent, EventCategory } from "@/lib/gemini/schemas";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface ActivityTimelineProps {
  events: ResearchEvent[];
}

function getCategoryBadge(category: EventCategory) {
  switch (category) {
    case "funding":
    case "prestocks":
      return "bg-accent/8 text-accent border-accent/20";
    case "regulatory":
    case "market":
      return "bg-secondary/10 text-secondary border-secondary/25";
    default:
      return "bg-surface-container-high text-on-surface-variant border-outline-variant/30";
  }
}

export default function ActivityTimeline({ events }: ActivityTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="py-6 px-4 text-center text-xs text-on-surface-variant bg-surface-container-lowest/40 rounded-xl border border-dashed border-outline-variant/20">
        No recent activity events recorded.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
      {events.map((event, idx) => (
        <div key={idx} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-surface-container-high border-2 border-accent flex-shrink-0" />

          {/* Event Content Box */}
          <div className="p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/15 hover:border-outline-variant/35 transition-colors space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`font-label uppercase tracking-wider text-[10px] px-2 py-0.5 rounded border ${getCategoryBadge(
                  event.category
                )}`}
              >
                {event.category}
              </span>

              {event.date && (
                <span className="text-[11px] font-mono text-on-surface-variant/70">
                  {event.date}
                </span>
              )}
            </div>

            <h4 className="font-headline font-semibold text-sm text-on-surface">
              {event.title}
            </h4>

            {event.summary && (
              <p className="text-xs text-on-surface-variant leading-relaxed font-light">
                {event.summary}
              </p>
            )}

            {/* Clickable Source */}
            {event.sourceUrl && (
              <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between text-[11px]">
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="font-medium text-accent/90">Source:</span>
                  <span className="underline decoration-outline-variant hover:decoration-on-surface truncate max-w-xs">
                    {event.sourceTitle}
                  </span>
                  <MaterialIcon icon="open_in_new" size="sm" />
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
