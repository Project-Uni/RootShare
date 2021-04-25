import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import EventClientHeader from '../../event-client/EventClientHeader';
import { RSText } from '../../base-components';
import {
  RSButton,
  RSCard,
  RSSelect,
  RSTextField,
} from '../../main-platform/reusable-components';
import {
  Model,
  DatabaseQuery,
  Populate,
} from '../../helpers/constants/databaseQuery';
import { IconButton } from '@material-ui/core';
import { IoCopyOutline, IoRemove } from 'react-icons/io5';
import Theme from '../../theme/Theme';
import {
  getSavedAdminDBQueries,
  putAdminDatabaseQuery,
  IGetSavedAdminDBQueriesResponse,
} from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { dispatchSnackbar } from '../../redux/actions';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import { useHistory } from 'react-router';
import { FaDatabase } from 'react-icons/fa';
import { DataTree } from './DataTree';
import { SaveModal } from './SaveModal';
import { formatTimestamp } from '../../helpers/functions';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {},
  querySyntax: {
    'word-break': 'break-all', //Not working for some reason
  },
  hoverUnderline: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  pointer: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  underline: {
    textDecoration: 'underline',
  },
}));

type Props = {};

export const AdminDBQuery = (props: Props) => {
  const styles = useStyles();

  const history = useHistory();

  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state: RootshareReduxState) => ({
    user: state.user,
    accessToken: state.accessToken,
  }));

  const [loading, setLoading] = useState(false);

  const [model, setModel] = useState<Model>('user');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [populates, setPopulates] = useState<
    {
      path: string;
      select: string[];
      populate?: { path: string; select: string[] };
    }[]
  >([]);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState('');
  const [sort, setSort] = useState<{ field: string; order: 1 | -1 }>({
    field: '',
    order: 1,
  });

  const [result, setResult] = useState<{ [k: string]: any }[]>();
  const [queryTime, setQueryTime] = useState(0);

  //Errors
  const [modelErr, setModelErr] = useState('');
  const [selectedFieldErr, setSelectedFieldErr] = useState('');
  const [populateSelectErr, setPopulateSelectErr] = useState('');
  const [queryErr, setQueryErr] = useState('');
  const [limitErr, setLimitErr] = useState('');

  const [showSaveModal, setShowSaveModal] = useState(false);

  const [savedQueries, setSavedQueries] = useState<
    IGetSavedAdminDBQueriesResponse['savedQueries']
  >([]);

  useEffect(() => {
    if (!Boolean(accessToken))
      history.push(`/login?redirect=${history.location.pathname}`);
    else if (user.privilegeLevel < 6) history.push('/notfound');
  }, []);

  useEffect(() => {
    getSavedQueries();
  }, []);

  const getSavedQueries = useCallback(async () => {
    const data = await getSavedAdminDBQueries();
    if (data.success === 1) {
      setSavedQueries(data.content.savedQueries);
    }
  }, []);

  const removeField = (field: string) => {
    const idx = selectedFields.findIndex((otherField) => otherField === field);
    const clone = [...selectedFields];
    clone.splice(idx, 1);
    setSelectedFields(clone);
  };

  const removePopulate = (populate: string) => {
    const idx = populates.findIndex((otherField) => otherField.path === populate);
    const clone = [...populates];
    clone.splice(idx, 1);
    setPopulates(clone);
  };

  const removePopulateSelect = (path: string, select: string) => {
    const idx = getStatePopulateIndex(path);
    const selectIdx = populates[idx].select.findIndex((other) => other === select);
    const clone = [...populates];
    clone[idx].select.splice(selectIdx, 1);
    setPopulates(clone);
  };

  const addPopulateSelect = (path: string, select: string) => {
    const index = getStatePopulateIndex(path);

    const clone = [...populates];
    clone[index].select.push(select);
    setPopulates(clone);
  };

  const getPopulateOptions = useCallback(
    (path: string) => {
      const index = getDBQueryPopulateIndex(path);
      if (index === -1 || !model) return [];

      const options = DatabaseQuery[model].populates[index].select.map((s) => ({
        label: s,
        value: s,
      }));
      return options;
    },
    [model]
  );

  const getDBQueryPopulateIndex = (path: string) => {
    if (!model) return -1;
    const index = DatabaseQuery[model].populates.findIndex((p) => p.path === path);
    return index;
  };

  const getStatePopulateIndex = (path: string) =>
    populates.findIndex((p) => p.path === path);

  const onSaveQuerySelect = (_id: string) => {
    const index = savedQueries.findIndex((s) => s._id === _id);
    const savedQuery = savedQueries[index];

    resetErrors();
    setModel(savedQuery.dbModel);
    setSelectedFields(savedQuery.selectedFields);
    setPopulates(savedQuery.populates);
    setQuery(savedQuery.query);
    setLimit(savedQuery.limit);
    setSort(savedQuery.sort);
  };

  const reset = () => {
    resetErrors();
    setModel('user');
    setSelectedFields([]);
    setPopulates([]);
    setQuery('');
    setLimit('');
    setSort({ field: '', order: 1 });
    setResult(undefined);
  };

  const resetErrors = () => {
    setModelErr('');
    setSelectedFieldErr('');
    setPopulateSelectErr('');
    setQueryErr('');
    setLimitErr('');
  };

  const validate = () => {
    let isValid = true;
    if (!model) {
      isValid = false;
      setModelErr('Select a valid model');
    }
    if (selectedFields.length === 0) {
      isValid = false;
      setSelectedFieldErr('At least one field is required.');
    }
    if (
      populates.some((p) => p.select.length === 0 || p.populate?.select.length === 0)
    ) {
      isValid = false;
      setPopulateSelectErr('All populates must have atleast one selected field.');
    }
    try {
      JSON.parse(query);
    } catch (err) {
      isValid = false;
      setQueryErr('Invalid mongoose JSON query');
    }

    if (limit && !/^\d+$/.test(limit)) {
      isValid = false;
      setLimitErr('Not a number');
    }
    return isValid;
  };

  const submitQuery = async () => {
    resetErrors();
    if (!validate()) return;

    const startTime = Date.now();

    setLoading(true);
    const data = await putAdminDatabaseQuery({
      query,
      limit,
      populates,
      select: selectedFields,
      model,
      sort,
    });
    if (data.success === 1) {
      setResult(data.content.data);
    } else {
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'There was an error completing the call',
        })
      );
    }
    const duration = Date.now() - startTime;
    setQueryTime(duration / 1000);
    setLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      <SaveModal
        onClose={() => setShowSaveModal(false)}
        open={showSaveModal}
        model={model}
        selectedFields={selectedFields}
        populates={populates}
        query={query}
        limit={limit}
        sort={sort}
      />
      <EventClientHeader showNavigationMenuDefault />
      <div
        style={{
          textAlign: 'left',
          padding: 20,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        <RSCard
          style={{
            border: `1px solid ${Theme.primaryText}`,
            background: Theme.background,
            padding: 15,
            borderRadius: 10,
            width: 325,
            maxHeight: window.innerHeight,
            overflow: 'scroll',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaDatabase
              color={Theme.secondaryText}
              size={20}
              style={{ marginRight: 20 }}
            />
            <RSText type="head" bold size={18}>
              Database Select
            </RSText>
          </div>
          <RSText italic style={{ marginTop: 7 }}>
            Admin tool to query the database.
          </RSText>

          <div>
            <RSSelect
              style={{ marginTop: 10 }}
              label="Model"
              options={modelOptions}
              fullWidth
              value={model}
              onChange={(e) => setModel(e.target.value as Model)}
              error={Boolean(modelErr)}
              helperText={modelErr}
            />
            <RSSelect
              style={{ marginTop: 10 }}
              label="Fields"
              fullWidth
              value=""
              options={
                model
                  ? DatabaseQuery[model].select.map((s) => ({ label: s, value: s }))
                  : []
              }
              onChange={(e) =>
                setSelectedFields([...selectedFields, e.target.value as string])
              }
              error={Boolean(selectedFieldErr)}
              helperText={selectedFieldErr}
            />
            {selectedFields.length > 0 && (
              <div
                style={{
                  border: `1px solid ${Theme.secondaryText}`,
                  padding: 10,
                  marginTop: 8,
                  background: Theme.foreground,
                  borderRadius: 8,
                }}
              >
                <RSText bold>Selected Fields</RSText>
                {selectedFields.map((field) => (
                  <Option label={field} onRemove={removeField} />
                ))}
              </div>
            )}
            <RSSelect
              label="Populate"
              fullWidth
              style={{ marginTop: 20 }}
              options={
                model
                  ? DatabaseQuery[model].populates.map((p) => ({
                      label: p.path,
                      value: p.path,
                    }))
                  : []
              }
              onChange={(e) =>
                setPopulates([
                  ...populates,
                  { path: e.target.value as string, select: [] },
                ])
              }
              value=""
              error={Boolean(populateSelectErr)}
              helperText={populateSelectErr}
            />
            {populates.map((p) => (
              <div
                style={{
                  border: `1px solid ${Theme.secondaryText}`,
                  marginTop: 8,
                  padding: 10,
                  background: Theme.foreground,
                  borderRadius: 8,
                }}
              >
                <RSText bold>Path:</RSText>
                <Option label={p.path} onRemove={removePopulate} />
                <RSText bold>Select:</RSText>
                <RSSelect
                  label="Populate select"
                  options={getPopulateOptions(p.path)}
                  fullWidth
                  onChange={(e) =>
                    addPopulateSelect(p.path, e.target.value as string)
                  }
                  value={''}
                />
                {p.select.map((s) => (
                  <Option
                    label={s}
                    onRemove={() => removePopulateSelect(p.path, s)}
                  />
                ))}
              </div>
            ))}
            <RSTextField
              style={{ marginTop: 15 }}
              fullWidth
              label="Query"
              multiline
              rows={5}
              variant="outlined"
              helperText={
                queryErr || `Mongoose query dictionary. Ex) {"_id": 'abcd'}`
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              error={Boolean(queryErr)}
            />
            <div style={{ display: 'flex', marginTop: 15 }}>
              <RSSelect
                label="Sort"
                options={
                  model
                    ? DatabaseQuery[model].select.map((s) => ({
                        label: s,
                        value: s,
                      }))
                    : []
                }
                style={{ flex: 1, marginRight: 15 }}
                value={sort.field}
                onChange={(e) => {
                  const sortClone = Object.assign({}, sort);
                  sortClone.field = e.target.value as string;
                  setSort(sortClone);
                }}
                helperText="(Optional) Field to sort by"
              />
              <RSSelect
                label="Order"
                options={[
                  { label: 'Asc.', value: 1 },
                  { label: 'Desc.', value: -1 },
                ]}
                style={{ width: 100 }}
                value={sort.order}
                onChange={(e) => {
                  const sortClone = Object.assign({}, sort);
                  sortClone.order = e.target.value as 1 | -1;
                  setSort(sortClone);
                }}
              />
            </div>
            <RSTextField
              style={{ width: 175, marginTop: 15 }}
              label="Limit"
              helperText={limitErr || '(Optional) Max docs'}
              variant="outlined"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value as string)}
              error={Boolean(limitErr)}
            />

            {model && selectedFields.length > 0 && query && (
              <div
                style={{
                  border: `1px solid ${Theme.primaryText}`,
                  background: Theme.foreground,
                  padding: 10,
                  marginTop: 10,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <RSText
                    bold
                    style={{ marginBottom: 10 }}
                    className={styles.querySyntax}
                  >
                    Syntax
                  </RSText>
                  <IconButton
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        getQuerySyntax({
                          model,
                          select: selectedFields,
                          limit,
                          query,
                          populates,
                          sort,
                        })
                      );
                      dispatch(
                        dispatchSnackbar({
                          mode: 'notify',
                          message: 'Copied query syntax!',
                        })
                      );
                    }}
                  >
                    <IoCopyOutline color={Theme.secondaryText} size={18} />
                  </IconButton>
                </div>
                <RSText>
                  {getQuerySyntax({
                    model,
                    select: selectedFields,
                    limit,
                    query,
                    populates,
                    sort,
                  })}
                </RSText>
              </div>
            )}
            <RSButton
              style={{ width: '100%', marginTop: 15 }}
              onClick={submitQuery}
              loading={loading}
            >
              Complete Query
            </RSButton>
            <RSButton
              style={{ width: '100%', marginTop: 10 }}
              variant="secondary"
              onClick={reset}
            >
              Reset
            </RSButton>
            <RSButton
              style={{ width: '100%', marginTop: 10 }}
              variant="university"
              onClick={() => setShowSaveModal(true)}
            >
              Save
            </RSButton>
          </div>
        </RSCard>
        <RSCard
          style={{
            border: `1px solid ${Theme.primaryText}`,
            background: Theme.background,
            padding: 10,
            borderRadius: 10,
            width: 250,
            maxHeight: window.innerHeight,
            overflow: 'scroll',
          }}
        >
          <RSText bold type="head" size={14}>
            Saved
          </RSText>
          <div>
            {savedQueries.map((s) => (
              <SavedQuery
                {...s}
                style={{ marginTop: 10 }}
                onSelect={onSaveQuerySelect}
              />
            ))}
          </div>
        </RSCard>

        {result && (
          <RSCard
            style={{
              marginLeft: 30,
              maxHeight: window.innerHeight,
              overflow: 'scroll',
              border: `1px solid ${Theme.primaryText}`,
              borderRadius: 10,
              padding: 20,
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RSText size={18}>Query Result</RSText>
              <IconButton
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    JSON.stringify(result, null, 2)
                  );
                  dispatch(
                    dispatchSnackbar({
                      mode: 'notify',
                      message: 'Copied query result!',
                    })
                  );
                }}
              >
                <IoCopyOutline color={Theme.secondaryText} size={22} />
              </IconButton>
            </div>
            <RSText bold italic style={{ marginTop: 7, marginBottom: 7 }}>
              {result.length} documents returned in {queryTime.toFixed(2)} seconds
            </RSText>
            <DataTree data={result} />
          </RSCard>
        )}
      </div>
    </div>
  );
};

const modelOptions = [
  { label: 'Comment', value: 'comment' },
  { label: 'Community', value: 'community' },
  { label: 'Community Edge', value: 'communityEdge' },
  { label: 'Connection', value: 'connection' },
  { label: 'Conversation', value: 'conversation' },
  { label: 'Document', value: 'document' },
  { label: 'External Communication', value: 'externalCommunication' },
  { label: 'External Link', value: 'externalLink' },
  { label: 'Image', value: 'image' },
  { label: 'Meet The Greek Interest', value: 'meetTheGreekInterest' },
  { label: 'Message', value: 'message' },
  { label: 'Notification', value: 'notification' },
  { label: 'Phone Verification', value: 'phone_verification' },
  { label: 'Post', value: 'post' },
  { label: 'Search', value: 'search' },
  { label: 'University', value: 'university' },
  { label: 'User', value: 'user' },
  { label: 'Webinar', value: 'webinar' },
];

const Option = (props: { label: string; onRemove: (value: string) => void }) => {
  const { label, onRemove } = props;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <RSText>{label}</RSText>
      <IconButton onClick={() => onRemove(label)}>
        <IoRemove color={Theme.secondaryText} size={14} />
      </IconButton>
    </div>
  );
};

const getQuerySyntax = ({
  model,
  select,
  populates,
  query,
  limit,
  sort,
}: {
  model: Model;
  select: string[];
  populates?: Populate[];
  query: string;
  limit?: string;
  sort?: { field: string; order: 1 | -1 };
}) => {
  let output = `${getModelName(model)}.model.find(${query}).select("${select.join(
    ' '
  )}")`;

  if (sort?.field) output += `.sort{ ${sort.field}: ${sort.order}}`;

  if (limit) output += `.limit(${limit})`;
  populates?.forEach((p) => {
    let secondPopulate = '';
    if (p.populate)
      secondPopulate = `, populate: { path: ${
        p.populate.path
      }, select: "${p.populate.select.join(' ')}" }`;

    output += `.populate({ path: ${p.path}, select: "${p.select.join(
      ' '
    )}"${secondPopulate} })`;
  });
  output += '.exec()';
  return output;
};

const getModelName = (model: Model) => {
  switch (model) {
    case 'comment':
      return 'Comment';
    case 'community':
      return 'Community';
    case 'communityEdge':
      return 'CommunityEdge';
    case 'connection':
      return 'Connection';
    case 'conversation':
      return 'Conversation';
    case 'document':
      return 'Document';
    case 'externalCommunication':
      return 'ExternalCommunication';
    case 'externalLink':
      return 'ExternalLink';
    case 'image':
      return 'Image';
    case 'meetTheGreekInterest':
      return 'MeetTheGreekInterest';
    case 'message':
      return 'Message';
    case 'notification':
      return 'Notifications';
    case 'phone_verification':
      return 'PhoneVerification';
    case 'post':
      return 'Post';
    case 'search':
      return 'Search';
    case 'university':
      return 'University';
    case 'user':
      return 'User';
    case 'webinar':
      return 'Webinar';
    default:
      return false;
  }
};

export const SavedQuery = (
  props: IGetSavedAdminDBQueriesResponse['savedQueries'][number] & {
    style?: React.CSSProperties;
    className?: string;
    onDelete?: (_id: string) => void;
    onSelect: (_id: string) => void;
  }
) => {
  const {
    _id,
    title,
    description,
    displayColor,
    createdAt,
    style,
    className,
    onDelete,
    onSelect,
  } = props;
  const styles = useStyles();

  const [hovering, setHovering] = useState(false);

  const handleDelete = useCallback(() => {
    if (
      window.confirm(
        'Are you sure you want to delete this saved query? This action cannot be undone.'
      )
    ) {
      onDelete?.(_id);
    }
  }, [onDelete]);

  return (
    <div
      style={{
        ...style,
        width: '100%',
        background: Theme.foreground,
        borderRadius: 5,
      }}
      className={className}
    >
      <div
        style={{
          background: displayColor,
          alignItems: 'center',
          padding: 3,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={styles.pointer}
        onClick={() => onSelect(_id)}
      >
        <RSText
          bold
          className={hovering ? styles.underline : undefined}
          color={Theme.white}
        >
          {title}
        </RSText>
      </div>
      <div style={{ margin: 5, paddingBottom: 5 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <RSText italic size={11}>
            {formatTimestamp(createdAt, 'MMM D h:mm A')}
          </RSText>
          <RSText
            color={Theme.error}
            size={11}
            style={{ marginRight: 7 }}
            className={[styles.hoverUnderline, styles.pointer].join(' ')}
            onClick={handleDelete}
          >
            Delete
          </RSText>
        </div>
        <RSText style={{ marginTop: 5 }}>{description}</RSText>
      </div>
    </div>
  );
};
