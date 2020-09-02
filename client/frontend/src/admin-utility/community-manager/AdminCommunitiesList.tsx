import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableFooter,
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

const COLUMNS = ['University', 'Type', 'Members', 'Pending', 'Admin', 'Private'];

type Props = {
  communities: Community[];
  loading?: boolean;
  editCommunity: (community: Community) => any;
};

function AdminCommunitiesList(props: Props) {
  const styles = useStyles();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currPage, setCurrPage] = useState(0);

  function handlePageChange(
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) {
    setCurrPage(newPage);
  }

  function handleRowsChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrPage(0);
  }

  function getPageContent() {
    if (itemsPerPage > 0) {
      return props.communities.slice(
        currPage * itemsPerPage,
        currPage * itemsPerPage + itemsPerPage
      );
    } else {
      return props.communities;
    }
  }

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
        {getPageContent().map((community) => (
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
              <RSText>{community.members.length}</RSText>
            </TableCell>
            <TableCell align="right">
              <RSText>{community.pendingMembers.length}</RSText>
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

          <TableFooter>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={props.communities.length}
              rowsPerPage={itemsPerPage}
              page={currPage}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handleRowsChange}
            />
          </TableFooter>
        </TableContainer>
      )}
    </div>
  );
}

export default AdminCommunitiesList;
