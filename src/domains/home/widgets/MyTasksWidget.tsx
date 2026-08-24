import { ListItemCustom, Icon, Button } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { BaseWidget } from './BaseWidget'
import { WidgetList } from './WidgetList'
import { formatDate, addDays, nearestWeekday } from '../../../utils/dates'

interface TaskGroup {
  icon: string
  iconColor?: string
  label: string
  count: number
  description: string
  chip?: {
    design?: 'negative' | 'none'
    leadingIcon: string
    value: string
  }
}

export function buildMyTasksPreviewGroups(): TaskGroup[] {
  const today = new Date()
  return [
    {
      icon: 'message-warning',
      iconColor: 'var(--sapNegativeTextColor)',
      label: 'Overdue',
      count: 4,
      description: 'Tasks past their due date',
      chip: { design: 'negative', leadingIcon: 'calendar', value: formatDate(addDays(today, -5)) },
    },
    {
      icon: 'pending',
      label: 'Today',
      count: 0,
      description: 'Tasks due today',
      chip: { design: 'none', leadingIcon: 'calendar', value: formatDate(today) },
    },
    {
      icon: 'date-time',
      label: 'Later this week',
      count: 4,
      description: 'Tasks due this week',
      chip: { design: 'none', leadingIcon: 'calendar', value: formatDate(addDays(today, 2)) },
    },
    {
      icon: 'calendar',
      label: 'Later',
      count: 12,
      description: 'Tasks due after this week',
      chip: { design: 'none', leadingIcon: 'calendar', value: formatDate(nearestWeekday(addDays(today, 21))) },
    },
    {
      icon: 'inbox',
      label: 'Without due date',
      count: 28,
      description: 'Tasks with no due date set',
    },
  ]
}

function buildPageTaskGroups(): TaskGroup[] {
  const today = new Date()
  return [
    {
      icon: 'pending',
      label: 'Today',
      count: 0,
      description: 'Tasks due today',
      chip: { design: 'none', leadingIcon: 'calendar', value: formatDate(today) },
    },
    {
      icon: 'inbox',
      label: 'Without due date',
      count: 12,
      description: 'Tasks with no due date set',
    },
  ]
}

interface MyTasksWidgetProps {
  taskGroups?: TaskGroup[]
  onViewAll?: () => void
  onItemClick?: () => void
  onRemove?: () => void
  /** Grid span read by CardGrid — not used in rendering. */
  gridSpan?: number
}

export function MyTasksWidget({ taskGroups = buildPageTaskGroups(), onViewAll, onItemClick, onRemove }: MyTasksWidgetProps) {
  return (
    <BaseWidget
      title="My Tasks"
      onRemove={onRemove}
      footer={onViewAll && <Button design="Transparent" onClick={onViewAll}>View All</Button>}
    >
      <WidgetList onItemClick={onItemClick}>
        {taskGroups.map((group) => (
          <ListItemCustom key={group.label} className="task-group-item">
            <div className="task-group-item__inner">
              <Icon name={group.icon} className="task-group-item__icon" style={group.iconColor ? { color: group.iconColor } : undefined} />

              <div className="task-group-item__body">
                <div className="task-group-item__title-row">
                  <span className="task-group-item__title">
                    {group.label} ({group.count})
                  </span>
                  {group.chip && (
                    <SigChipV2
                      design={group.chip.design ?? 'none'}
                      leadingIcon={group.chip.leadingIcon}
                      value={group.chip.value}
                      condensed
                    />
                  )}
                </div>
                <span className="task-group-item__description">{group.description}</span>
              </div>
            </div>
          </ListItemCustom>
        ))}
      </WidgetList>
    </BaseWidget>
  )
}
