import { useState, useMemo } from 'react';
import { Button, Input, Title, ToolbarItem } from '@ui5/webcomponents-react';
import ButtonDesign from '@ui5/webcomponents/dist/types/ButtonDesign.js';
import TitleLevel from '@ui5/webcomponents/dist/types/TitleLevel.js';
import WrappingType from '@ui5/webcomponents/dist/types/WrappingType.js';
import { SigTableWrapper, SigFilterBar, SigFilter, SingleSelect } from '@signavio/sap-signavio-uixtension';
import '@ui5/webcomponents-icons/dist/filter.js';
import '@ui5/webcomponents-icons/dist/sort-descending.js';
import { ObjectivesTable } from './components/ObjectivesTable';
import { OBJECTIVES, PTM_OWNERS } from '@/data/ptm';
import s from './MvpObjectivesOverview.module.css';

interface MvpObjectivesOverviewProps {
}

export const MvpObjectivesOverview = ({}: MvpObjectivesOverviewProps) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter bar visibility
  const [filterBarOpen, setFilterBarOpen] = useState(false);

  // Filter state - using Record<string, unknown> to match SigFilterBar's FilterValues type
  const [filters, setFilters] = useState<Record<string, unknown>>({
    status: 'all',
    progress: 'all',
    owner: 'all',
  });

  const defaultFilters: Record<string, unknown> = {
    status: 'all',
    progress: 'all',
    owner: 'all',
  };

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'On Track', label: 'On Track' },
    { value: 'Behind', label: 'Behind' },
    { value: 'At Risk', label: 'At Risk' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Planned', label: 'Planned' },
  ];

  const progressOptions = [
    { value: 'all', label: 'All' },
    { value: '0-25', label: '0-25%' },
    { value: '26-50', label: '26-50%' },
    { value: '51-75', label: '51-75%' },
    { value: '76-100', label: '76-100%' },
  ];

  const ownerOptions = [
    { value: 'all', label: 'All' },
    ...PTM_OWNERS.map((owner) => ({ value: owner.id, label: owner.name })),
  ];

  // Filter logic - recursively filter objectives and their children
  const filteredObjectives = useMemo(() => {
    const filterNode = (obj: (typeof OBJECTIVES)[0]): typeof obj | null => {
      // Check if this node matches search query (case-insensitive)
      const matchesSearch =
        !searchQuery ||
        obj.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Check if this node matches filters
      let matchesFilters = true;

      // Status filter
      if (filters.status !== 'all' && obj.status !== filters.status) {
        matchesFilters = false;
      }

      // Progress filter
      if (filters.progress !== 'all') {
        const progressValue = filters.progress as string;
        const [min, max] = progressValue.split('-').map(Number);
        if (obj.progress < min || obj.progress > max) {
          matchesFilters = false;
        }
      }

      // Owner filter
      if (filters.owner !== 'all' && obj.owner.id !== filters.owner) {
        matchesFilters = false;
      }

      // Recursively filter children
      const filteredChildren = obj.children
        ? obj.children.map(filterNode).filter((child) => child !== null)
        : [];

      // Include this node if it matches search AND filters, OR if any children match
      if ((matchesSearch && matchesFilters) || filteredChildren.length > 0) {
        return {
          ...obj,
          children: filteredChildren,
        };
      }

      return null;
    };

    return OBJECTIVES.map(filterNode).filter((obj) => obj !== null);
  }, [filters, searchQuery]);

  return (
    <div className={s.page}>
      {/* Page Title */}
      <div className={s.titleBar}>
        <Title level={TitleLevel.H2} style={{ fontSize: '32px', fontWeight: 900 } as React.CSSProperties}>Objectives</Title>
      </div>

      {/* Table with Toolbar and Filter Bar */}
      <div className={s.tableWrapper}>
        <SigTableWrapper
          titleSlot={
            <ToolbarItem>
              <Title level={TitleLevel.H3} wrappingType={WrappingType.None} style={{ fontSize: '16px' }}>
                Objectives ({filteredObjectives.length})
              </Title>
            </ToolbarItem>
          }
          businessActionsSlot={
            <Button design={ButtonDesign.Emphasized}>Create Objective</Button>
          }
          searchSlot={
            <Input
              placeholder="Search..."
              style={{ width: '207px' }}
              value={searchQuery}
              onInput={(e) => setSearchQuery((e.target as any).value)}
            />
          }
          sortSlot={
            <Button icon="sort-descending" design={ButtonDesign.Transparent}>
              Sort
            </Button>
          }
          filterBarToggleButton={
            <Button
              icon="filter"
              design={ButtonDesign.Transparent}
              onClick={() => setFilterBarOpen(!filterBarOpen)}
            >
              Filter
            </Button>
          }
          filterBarSlot={
            filterBarOpen ? (
              <div className={s.filterBarWrapper}>
                <SigFilterBar
                  filters={filters}
                  onFiltersChange={setFilters}
                  defaultFilters={defaultFilters}
                  showManageFilters={false}
                >
                  <SigFilter label="Status" filterKey="status">
                    <SingleSelect options={statusOptions} />
                  </SigFilter>
                  <SigFilter label="Progress" filterKey="progress">
                    <SingleSelect options={progressOptions} />
                  </SigFilter>
                  <SigFilter label="Owner" filterKey="owner">
                    <SingleSelect options={ownerOptions} />
                  </SigFilter>
                </SigFilterBar>
              </div>
            ) : undefined
          }
        >
          <ObjectivesTable objectives={filteredObjectives} />
        </SigTableWrapper>
      </div>
    </div>
  );
};
