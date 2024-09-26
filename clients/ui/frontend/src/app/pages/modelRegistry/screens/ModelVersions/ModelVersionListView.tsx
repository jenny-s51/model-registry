import * as React from 'react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  TextInput,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { EllipsisVIcon, FilterIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router';
import { ModelVersion, RegisteredModel } from '~/app/types';
import { ModelRegistrySelectorContext } from '~/app/context/ModelRegistrySelectorContext';
import { SearchType } from '~/app/components/DashboardSearchField';
import {
  filterModelVersions,
  sortModelVersionsByCreateTime,
} from '~/app/pages/modelRegistry/screens/utils';
import EmptyModelRegistryState from '~/app/pages/modelRegistry/screens/components/EmptyModelRegistryState';
import { ProjectObjectType, typedEmptyImage } from '~/app/components/design/utils';
import {
  modelVersionArchiveUrl,
  registerVersionForModelUrl,
} from '~/app/pages/modelRegistry/screens/routeUtils';
import { asEnumMember } from '~/app/utils';
import ModelVersionsTable from '~/app/pages/modelRegistry/screens/ModelVersions/ModelVersionsTable';
import SimpleSelect from '~/app/components/SimpleSelect';

type ModelVersionListViewProps = {
  modelVersions: ModelVersion[];
  registeredModel?: RegisteredModel;
  refresh: () => void;
};

const ModelVersionListView: React.FC<ModelVersionListViewProps> = ({
  modelVersions: unfilteredModelVersions,
  registeredModel: rm,
  refresh,
}) => {
  const navigate = useNavigate();
  const { preferredModelRegistry } = React.useContext(ModelRegistrySelectorContext);

  const [searchType, setSearchType] = React.useState<SearchType>(SearchType.KEYWORD);
  const [search, setSearch] = React.useState('');

  const searchTypes = [SearchType.KEYWORD, SearchType.AUTHOR];

  const [isArchivedModelVersionKebabOpen, setIsArchivedModelVersionKebabOpen] =
    React.useState(false);

  const filteredModelVersions = filterModelVersions(unfilteredModelVersions, search, searchType);

  if (unfilteredModelVersions.length === 0) {
    return (
      <EmptyModelRegistryState
        testid="empty-model-versions"
        title="No versions"
        headerIcon={() => (
          <img
            src={typedEmptyImage(ProjectObjectType.registeredModels, 'MissingVersion')}
            alt="missing version"
          />
        )}
        description={`${rm?.name} has no registered versions. Register a version to this model.`}
        primaryActionText="Register new version"
        secondaryActionText="View archived versions"
        primaryActionOnClick={() => {
          navigate(registerVersionForModelUrl(rm?.id, preferredModelRegistry?.name));
        }}
        secondaryActionOnClick={() => {
          navigate(modelVersionArchiveUrl(rm?.id, preferredModelRegistry?.name));
        }}
      />
    );
  }

  return (
    <ModelVersionsTable
      refresh={refresh}
      clearFilters={() => setSearch('')}
      modelVersions={sortModelVersionsByCreateTime(filteredModelVersions)}
      toolbarContent={
        <ToolbarContent>
          <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
            <ToolbarGroup variant="filter-group">
              <ToolbarFilter
                labels={search === '' ? [] : [search]}
                deleteLabel={() => setSearch('')}
                deleteLabelGroup={() => setSearch('')}
                categoryName={searchType}
              >
                <SimpleSelect
                  dataTestId="model-versions-table-filter"
                  options={searchTypes.map((key) => ({
                    key,
                    label: key,
                  }))}
                  value={searchType}
                  onChange={(newSearchType) => {
                    const enumMember = asEnumMember(newSearchType, SearchType);
                    if (enumMember !== null) {
                      setSearchType(enumMember);
                    }
                  }}
                  icon={<FilterIcon />}
                />
              </ToolbarFilter>
              <ToolbarItem variant="label">
                <div className="form-fieldset-wrapper">
                  <TextInput
                    value={search}
                    type="text"
                    onChange={(_, searchValue) => {
                      setSearch(searchValue);
                    }}
                    style={{ minWidth: '200px' }}
                    data-testid="model-versions-table-search"
                  />
                  <fieldset aria-hidden="true" className="form-fieldset">
                    <legend className="form-fieldset-legend">
                      <span>Find by keyword</span>
                    </legend>
                  </fieldset>
                </div>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarToggleGroup>
          <ToolbarItem>
            <Button
              variant="secondary"
              onClick={() => {
                navigate(registerVersionForModelUrl(rm?.id, preferredModelRegistry?.name));
              }}
            >
              Register new version
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Dropdown
              isOpen={isArchivedModelVersionKebabOpen}
              onSelect={() => setIsArchivedModelVersionKebabOpen(false)}
              onOpenChange={(isOpen: boolean) => setIsArchivedModelVersionKebabOpen(isOpen)}
              toggle={(tr: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  data-testid="model-versions-table-kebab-action"
                  ref={tr}
                  variant="plain"
                  onClick={() =>
                    setIsArchivedModelVersionKebabOpen(!isArchivedModelVersionKebabOpen)
                  }
                  isExpanded={isArchivedModelVersionKebabOpen}
                  aria-label="View archived versions"
                >
                  <EllipsisVIcon />
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <DropdownList>
                <DropdownItem
                  onClick={() =>
                    navigate(modelVersionArchiveUrl(rm?.id, preferredModelRegistry?.name))
                  }
                >
                  View archived versions
                </DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
        </ToolbarContent>
      }
    />
  );
};

export default ModelVersionListView;
