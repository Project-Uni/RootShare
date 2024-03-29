import React from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { RSText } from '../../base-components';
import Theme from '../../theme/Theme';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {
    width: '100%',
  },
}));

type Props = {
  data: { [k: string]: any }[];
};

export const DataTree = (props: Props) => {
  const styles = useStyles();

  const { data } = props;

  const renderNode = (currentObj: { [k: string]: any }): any => {
    const keys = Object.keys(currentObj);
    return keys.map((k, idx) => {
      if (!currentObj[k] || currentObj[k]?.length === 0) {
        return <></>;
      } else if (typeof currentObj[k] !== 'object') {
        return (
          <TreeItem
            nodeId={`${Math.random().toFixed(3)}_${idx}_${k}`}
            label={
              <RSText>
                <b style={{ marginRight: 7 }}>{k}:</b>
                {currentObj[k]}
              </RSText>
            }
            style={{ width: '100%' }}
          />
        );
      } else {
        return (
          <TreeItem
            nodeId={`${Math.random().toFixed(3)}_${idx}_${k}`}
            label={k}
            style={{ width: '100%' }}
          >
            {renderNode(currentObj[k] as any)}
          </TreeItem>
        );
      }
    });
  };

  return (
    <TreeView
      className={styles.wrapper}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      {data.map((d, idx) => (
        <div
          style={{
            borderBottom: `1px solid ${Theme.secondaryText}`,
            display: 'flex',
            alignItems: 'center',
            paddingTop: 7,
            paddingBottom: 7,
          }}
        >
          <RSText bold style={{ marginRight: 12 }}>
            {idx + 1}
          </RSText>
          <div>{renderNode(d)}</div>
        </div>
      ))}
    </TreeView>
  );
};
