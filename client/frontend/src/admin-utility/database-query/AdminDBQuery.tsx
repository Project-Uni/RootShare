import React, { useCallback, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import EventClientHeader from '../../event-client/EventClientHeader';
import { RSText } from '../../base-components';
import {
  RSButton,
  RSSelect,
  RSTextField,
} from '../../main-platform/reusable-components';
import { Model, Models, DatabaseQuery } from '../../helpers/constants/databaseQuery';
import { IconButton } from '@material-ui/core';
import { IoRemove } from 'react-icons/io5';
import Theme from '../../theme/Theme';
import { putAdminDatabaseQuery } from '../../api';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({ wrapper: {} }));

type Props = {};

export const AdminDBQuery = (props: Props) => {
  const styles = useStyles();

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
  const [limit, setLimit] = useState<string>('');

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

  const reset = () => {
    setModel('user');
    setSelectedFields([]);
    setPopulates([]);
    setQuery('');
    setLimit('');
  };

  const submitQuery = async () => {
    setLoading(true);
    const data = await putAdminDatabaseQuery({
      query,
      limit,
      populates,
      select: selectedFields,
      model,
    });
    setLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      <EventClientHeader showNavigationMenuDefault />
      <div style={{ textAlign: 'left', padding: 20 }}>
        <RSText type="head" bold size={18}>
          Database Select
        </RSText>
        <div style={{ width: 300 }}>
          <RSSelect
            style={{ marginTop: 10 }}
            label="Model"
            options={modelOptions}
            fullWidth
            value={model}
            onChange={(e) => setModel(e.target.value as Model)}
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
          />
          {selectedFields.length > 0 && (
            <RSText bold style={{ marginTop: 20 }}>
              Selected Fields
            </RSText>
          )}
          {selectedFields.map((field) => (
            <Option label={field} onRemove={removeField} />
          ))}

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
          />
          {populates.map((p) => (
            <div
              style={{
                border: `1px solid ${Theme.secondaryText}`,
                marginTop: 8,
                padding: 10,
              }}
            >
              <RSText bold>Path:</RSText>
              <Option label={p.path} onRemove={removePopulate} />
              <RSText bold>Select:</RSText>
              <RSSelect
                label="Populate select"
                options={getPopulateOptions(p.path)}
                fullWidth
                onChange={(e) => addPopulateSelect(p.path, e.target.value as string)}
                value={''}
              />
              {p.select.map((s) => (
                <Option label={s} onRemove={() => removePopulateSelect(p.path, s)} />
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
            helperText="Mongoose query dictionary. Ex) {_id: 'abcd'}"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <RSTextField
            style={{ width: 175, marginTop: 15 }}
            label="Limit"
            helperText="Max docs (optional)"
            variant="outlined"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value as string)}
          />
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
        </div>
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
