import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@material-ui/core';

import { Community } from '../../helpers/types';

import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 15,
  },
  tableContainer: {},
  communityName: {
    '&:hover': {
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  },
  loadingIndicator: {
    color: colors.primary,
    marginTop: 100,
  },
}));

const COLUMNS = ['University', 'Type', 'Members', 'Admin', 'Private'];

type Props = {
  communities: Community[];
  loading?: boolean;
  editCommunity: (community: Community) => any;
};

function AdminCommunitiesList(props: Props) {
  const styles = useStyles();

  function renderTableHead() {
    return (
      <TableHead>
        <TableCell>
          <RSText bold type="body">
            Community
          </RSText>
        </TableCell>
        {COLUMNS.map((column) => (
          <TableCell align="right">
            <RSText bold type="body">
              {column}
            </RSText>
          </TableCell>
        ))}
      </TableHead>
    );
  }

  function renderTableBody() {
    return (
      <TableBody>
        {props.communities.map((community) => (
          <TableRow key={community.name}>
            <TableCell>
              <a
                href={undefined}
                onClick={() => {
                  props.editCommunity(community);
                }}
              >
                <RSText className={styles.communityName} bold color={colors.primary}>
                  {community.name}
                </RSText>
              </a>
            </TableCell>
            <TableCell align="right">
              <RSText>{community.university.universityName}</RSText>
            </TableCell>
            <TableCell align="right">
              <RSText>{community.type}</RSText>
            </TableCell>
            <TableCell align="right">
              <RSText>{(community.members as any[]).length}</RSText>
            </TableCell>
            <TableCell align="right">
              <RSText>
                {community.admin.firstName} {community.admin.lastName}
              </RSText>
            </TableCell>
            <TableCell align="right">
              <RSText>{community.private ? 'True' : 'False'}</RSText>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  }

  return (
    <div className={styles.wrapper}>
      {props.loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : (
        <TableContainer component={Paper}>
          <Table className={styles.tableContainer}>
            {renderTableHead()}
            {renderTableBody()}
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default AdminCommunitiesList;
