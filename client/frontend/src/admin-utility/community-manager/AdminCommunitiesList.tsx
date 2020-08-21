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
} from '@material-ui/core';

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
}));

const COLUMNS = ['University', 'Type', 'Members', 'Admin', 'Private'];

type Props = {};

function AdminCommunitiesList(props: Props) {
  const styles = useStyles();

  const communities: { [key: string]: any }[] = [];
  for (let i = 0; i < 10; i++) {
    communities.push({
      name: 'Test Community',
      admin: 'Ashwin Mahesh',
      members: 790,
      type: 'Social',
      private: true,
      university: 'Purdue University',
    });
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
        {communities.map((community) => (
          <TableRow key={community.name}>
            <TableCell>
              <a
                href={undefined}
                onClick={() => {
                  console.log('Clicking on community');
                }}
              >
                <RSText className={styles.communityName} bold color={colors.primary}>
                  {community.name}
                </RSText>
              </a>
            </TableCell>
            <TableCell align="right">
              <RSText>{community.university}</RSText>
            </TableCell>
            <TableCell align="right">
              <RSText>{community.type}</RSText>
            </TableCell>
            <TableCell align="right">
              <RSText>{community.members}</RSText>
            </TableCell>
            <TableCell align="right">
              <RSText>{community.admin}</RSText>
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
      <TableContainer component={Paper}>
        <Table className={styles.tableContainer}>
          {renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    </div>
  );
}

export default AdminCommunitiesList;
