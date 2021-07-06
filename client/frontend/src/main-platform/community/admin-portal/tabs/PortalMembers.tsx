import React, { useState, useEffect } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { CSVDownload } from 'react-csv';

import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../../redux/store/stateManagement';
import { dispatchSnackbar } from '../../../../redux/actions';

import { AiOutlineDownload } from 'react-icons/ai';
import { FiSend } from 'react-icons/fi';
import { BsGridFill, BsListUl } from 'react-icons/bs';
import { IoMdRemoveCircle, IoMdAddCircle } from 'react-icons/io';
import { RiEditCircleFill } from 'react-icons/ri';
import Switch from 'react-switch';
import { Grid } from '@material-ui/core';

import { RSText } from '../../../../base-components';
import {
  RSLink,
  RSButtonV2,
  RSTabsV2,
  RSIconButton,
  RSAvatar,
  RSModal,
  RSButton,
  RSTextField,
} from '../../../reusable-components';
import SinglePendingRequest from '../../components/SinglePendingRequest';

import Theme from '../../../../theme/Theme';
import {
  getCommunityAdminMembers,
  deleteCommunityMember,
  putPendingMember,
  deleteCommunityBoardMember,
  putCommunityBoardMember,
  getCommunityAdminMemberData,
} from '../../../../api';
import {
  UserAvatar,
  UserType,
  MuiGridValues,
  BoardMember,
} from '../../../../helpers/types';
import {
  removeFromStateArray,
  updateFieldInStateArray,
} from '../../../../helpers/functions';
import { SHOW_HEADER_NAVIGATION_WIDTH } from '../../../../helpers/constants';
import { COMMUNITY_LEFT_SIDEBAR_OFFSET } from '../CommunityAdminPortalLeftSidebar';
import { AUTHENTICATED_PAGE_MAX_WIDTH } from '../../../base-page-frames/AuthenticatedPage';

const BOARD_MEMBER_GRID_PADDING = 30;

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {},
  switchIconWrapper: {
    display: 'flex',
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

type MemberTab = 'members' | 'requests'; //| 'invites';

type Props = {
  communityID: string;
};

export const PortalMembers = (props: Props) => {
  const styles = useStyles();
  const dispatch = useDispatch();

  const { communityID } = props;

  const { userID } = useSelector((state: RootshareReduxState) => ({
    userID: state.user._id,
  }));

  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState(false);
  const [downloadMembers, setDownloadMembers] = useState<UserType[]>();

  const [members, setMembers] = useState<UserAvatar[]>([]);
  const [pendingMembers, setPendingMembers] = useState<UserAvatar[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);

  const [managingBoard, setManagingBoard] = useState(false);
  const [managingMembers, setManagingMembers] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [title, setTitle] = useState('');
  const [titleUserID, setTitleUserID] = useState('');

  const [viewType, setViewType] = useState<'list' | 'grid'>('grid');
  const [selectedMemberTab, setSelectedMemberTab] = useState<MemberTab>('members');

  const [colSize, setColSize] = useState<MuiGridValues>(2);
  const [boardGridWidth, setBoardGridWidth] = useState(1500);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (communityID) fetchData();
  }, [communityID]);

  useEffect(() => {
    if (downloadMembers) setDownloadMembers(undefined);
  }, [downloadMembers]);

  const fetchData = async () => {
    setLoading(true);
    const data = await getCommunityAdminMembers(communityID);
    if (data.success !== 1) return setFetchErr(true);

    setMembers(data.content.members);
    setPendingMembers(data.content.pendingMembers);
    setBoardMembers(data.content.boardMembers);
    setLoading(false);
  };

  const handleRejectUser = async (userID: string) => {
    const data = await putPendingMember(props.communityID, userID, 'reject');

    if (data.success !== 1)
      return dispatch(
        dispatchSnackbar({ mode: 'error', message: 'Error removing request' })
      );

    removeFromStateArray(userID, '_id', setPendingMembers);
  };

  const handleAcceptUser = async (userID: string) => {
    const data = await putPendingMember(props.communityID, userID, 'accept');

    if (data.success !== 1)
      return dispatch(
        dispatchSnackbar({ mode: 'error', message: 'Error accepting request' })
      );

    const newMember = pendingMembers
      .filter((pending) => pending._id === userID)
      .shift();
    if (newMember) setMembers((prevMembers) => prevMembers.concat(newMember));
    removeFromStateArray(userID, '_id', setPendingMembers);
  };

  const handleRemoveMember = async (userID: string) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this member from the community?'
      )
    )
      return;

    const data = await deleteCommunityMember(communityID, userID);

    if (data.success !== 1)
      return dispatch(
        dispatchSnackbar({ mode: 'error', message: 'Error removing member' })
      );

    removeFromStateArray(userID, '_id', setMembers);
    removeFromStateArray(userID, '_id', setBoardMembers);
  };

  const handleRemoveBoardMember = async (userID: string) => {
    if (
      !window.confirm('Are you sure you want to remove this member from the board?')
    )
      return;

    const data = await deleteCommunityBoardMember(communityID, userID);

    if (data.success !== 1)
      return dispatch(
        dispatchSnackbar({ mode: 'error', message: 'Error removing board member' })
      );

    removeFromStateArray(userID, '_id', setBoardMembers);
  };

  const handleAddBoardMember = async (userID: string, title: string) => {
    if (!title)
      return dispatch(
        dispatchSnackbar({
          mode: 'notify',
          message: 'Please enter a valid title',
        })
      );

    const data = await putCommunityBoardMember(communityID, userID, title);

    if (data.success !== 1)
      return dispatch(
        dispatchSnackbar({ mode: 'error', message: 'Error adding board member' })
      );

    setShowTitleModal(false);
    const existingBoardMember = boardMembers
      .filter((boardMember) => boardMember._id === userID)
      .shift();
    if (existingBoardMember)
      return updateFieldInStateArray(userID, '_id', title, 'title', setBoardMembers);

    const newBoardMember = members.filter((member) => member._id === userID).shift();
    if (newBoardMember)
      setBoardMembers((prevBoard) => prevBoard.concat({ ...newBoardMember, title }));
  };

  const handleResize = () => {
    setColSize(() => {
      if (window.innerWidth < 800) return 4;
      if (window.innerWidth < 1200) return 3;
      return 2;
    });

    const leftSideBarOffset =
      window.innerWidth < SHOW_HEADER_NAVIGATION_WIDTH
        ? 0
        : COMMUNITY_LEFT_SIDEBAR_OFFSET;

    setBoardGridWidth(
      Math.min(window.innerWidth, AUTHENTICATED_PAGE_MAX_WIDTH) -
        leftSideBarOffset -
        BOARD_MEMBER_GRID_PADDING * 2
    );
  };

  const handleViewChange = () => {
    setViewType((prevViewType) => (prevViewType === 'grid' ? 'list' : 'grid'));
  };

  const handleDownloadClicked = async () => {
    const data = await getCommunityAdminMemberData(communityID);
    setDownloadMembers(data.content.members);
  };

  function renderBoardMembers() {
    return (
      <div
        style={{
          textAlign: 'left',
          padding: BOARD_MEMBER_GRID_PADDING,
          paddingTop: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <RSText size={24}>Executive Board</RSText>
          {managingBoard ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RSLink
                style={{ padding: 10 }}
                underline="hover"
                onClick={() => setManagingBoard(false)}
              >
                <RSText size={11} color={Theme.error}>
                  Done
                </RSText>
              </RSLink>
            </div>
          ) : (
            <RSLink
              style={{ padding: 10 }}
              underline="hover"
              onClick={() => setManagingBoard(true)}
            >
              <RSText size={11}>Manage</RSText>
            </RSLink>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            overflowY: 'scroll',
            boxShadow: Theme.fullShadow,
            minWidth: 0,
            // maxWidth: '60vw',
            width: boardGridWidth,
          }}
        >
          {boardMembers.map((boardMember) => (
            <div
              key={boardMember._id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: 15,
              }}
            >
              {managingBoard && boardMember._id !== userID && (
                <RSIconButton
                  style={{
                    marginRight: 87,
                    marginLeft: -9,
                    marginBottom: -35,
                    marginTop: -7,
                    zIndex: 1,
                    position: 'relative',
                  }}
                  Icon={IoMdRemoveCircle}
                  primaryColor={Theme.error}
                  iconSize={26}
                  onClick={() => handleRemoveBoardMember(boardMember._id)}
                />
              )}
              {managingBoard && boardMember._id !== userID && (
                <RSIconButton
                  style={{
                    marginLeft: 83,
                    marginRight: -7,
                    marginBottom: -35,
                    marginTop: -7,
                    zIndex: 1,
                    position: 'relative',
                  }}
                  Icon={RiEditCircleFill}
                  primaryColor={Theme.secondaryText}
                  iconSize={26}
                  onClick={() => {
                    setTitle('');
                    setTitleUserID(boardMember._id);
                    setShowTitleModal(true);
                  }}
                />
              )}
              <RSLink
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                href={`/profile/${boardMember._id}`}
                underline="hover"
              >
                <RSAvatar
                  src={boardMember.profilePicture}
                  size={120}
                  style={{ boxShadow: Theme.fullShadow }}
                />
                <RSText
                  size={12}
                  weight="normal"
                  style={{ paddingTop: 10 }}
                >{`${boardMember.firstName} ${boardMember.lastName}`}</RSText>
              </RSLink>
              <RSText size={10} weight="light" style={{ paddingTop: 4 }}>
                {boardMember.title}
              </RSText>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderMemberRequests() {
    return (
      <div style={{ boxShadow: Theme.fullShadow }}>
        <RSText
          type="head"
          size={15}
          style={{ padding: 10, paddingLeft: 20, marginTop: 20 }}
        >
          {pendingMembers.length} Pending Member
          {pendingMembers.length !== 1 && 's'}
        </RSText>

        {pendingMembers.length === 0 ? (
          <div
            style={{ paddingLeft: 15, paddingRight: 15, paddingBottom: 20, flex: 1 }}
          >
            <RSText size={14}>There no pending requests.</RSText>
          </div>
        ) : (
          <div
            style={{
              overflow: 'scroll',
              maxHeight: 700,
            }}
          >
            {pendingMembers.map((pendingMember, idx) => (
              <SinglePendingRequest
                key={pendingMember._id}
                name={`${pendingMember.firstName} ${pendingMember.lastName}`}
                _id={pendingMember._id}
                profilePicture={pendingMember.profilePicture}
                onAccept={handleAcceptUser}
                onReject={handleRejectUser}
                type="user"
                style={{
                  // width: '100%',
                  paddingTop: 4,
                  paddingBottom: 4,
                  backgroundColor:
                    idx % 2 === 0 ? Theme.primaryHover : Theme.background,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderGridViewMembers() {
    return (
      <div
        style={{
          display: 'flex',
          marginTop: 20,
          overflow: 'scroll',
          maxHeight: 700,
          boxShadow: Theme.fullShadow,
        }}
      >
        <Grid container>
          {members.map((member) => (
            <Grid
              key={member._id}
              item
              xs={colSize}
              justify="center"
              alignContent="center"
              alignItems="center"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: 15,
              }}
            >
              {managingMembers && member._id !== userID && (
                <RSIconButton
                  style={{
                    marginRight: 95,
                    marginBottom: -35,
                    marginTop: -7,
                    zIndex: 1,
                    position: 'relative',
                  }}
                  Icon={IoMdRemoveCircle}
                  primaryColor={Theme.error}
                  iconSize={26}
                  onClick={() => handleRemoveMember(member._id)}
                />
              )}
              {managingMembers && member._id !== userID && (
                <RSIconButton
                  style={{
                    marginLeft: 89,
                    marginBottom: -35,
                    marginTop: -7,
                    zIndex: 1,
                    position: 'relative',
                  }}
                  Icon={IoMdAddCircle}
                  primaryColor={Theme.success}
                  iconSize={26}
                  onClick={() => {
                    setTitle('');
                    setTitleUserID(member._id);
                    setShowTitleModal(true);
                  }}
                />
              )}
              <RSLink
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                href={`/profile/${member._id}`}
                underline="hover"
              >
                <RSAvatar
                  src={member.profilePicture}
                  size={120}
                  style={{
                    boxShadow: Theme.fullShadow,
                  }}
                />
                <RSText size={11} weight="normal" style={{ paddingTop: 10 }}>
                  {`${member.firstName} ${member.lastName}`}
                </RSText>
              </RSLink>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  }

  function renderListViewMembers() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          overflow: 'scroll',
          maxHeight: 700,
          marginTop: 20,
          boxShadow: Theme.fullShadow,
        }}
      >
        {members.map((member, idx) => (
          <div
            key={member._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              paddingTop: 4,
              paddingBottom: 4,
              backgroundColor: idx % 2 === 0 ? Theme.primaryHover : Theme.background,
            }}
          >
            <RSLink
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
              href={`/profile/${member._id}`}
              underline="hover"
            >
              <RSAvatar
                src={member.profilePicture}
                size={35}
                style={{ boxShadow: Theme.fullShadow }}
              />
              <RSText size={11} weight="normal" style={{ paddingLeft: 10 }}>
                {`${member.firstName} ${member.lastName}`}
              </RSText>
            </RSLink>
            <div style={{ flex: 1 }} />
            {managingMembers && member._id !== userID && (
              <div style={{ display: 'flex' }}>
                <RSButtonV2
                  style={{
                    color: Theme.altText,
                    background: Theme.error,
                    height: 27,
                    marginRight: 10,
                  }}
                  onClick={() => handleRemoveMember(member._id)}
                >
                  Remove
                </RSButtonV2>
                <RSButtonV2
                  style={{
                    color: Theme.altText,
                    background: Theme.success,
                    height: 27,
                    marginRight: 20,
                  }}
                  onClick={() => {
                    setTitle('');
                    setTitleUserID(member._id);
                    setShowTitleModal(true);
                  }}
                >
                  Add to Board
                </RSButtonV2>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderMembers() {
    return (
      <div style={{ textAlign: 'left', padding: 30, paddingTop: 50 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <RSText size={24}>Members</RSText>
          {selectedMemberTab === 'members' &&
            (managingMembers ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RSLink
                  style={{ padding: 10 }}
                  underline="hover"
                  onClick={() => setManagingMembers(false)}
                >
                  <RSText size={11} color={Theme.error}>
                    Done
                  </RSText>
                </RSLink>
              </div>
            ) : (
              <RSLink
                style={{ padding: 10 }}
                underline="hover"
                onClick={() => setManagingMembers(true)}
              >
                <RSText size={11}>Manage</RSText>
              </RSLink>
            ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'center',
          }}
        >
          <RSTabsV2
            tabs={[
              { label: 'Members', value: 'members' },
              { label: 'Requests', value: 'requests' },
              // { label: 'Invites', value: 'invites' },
            ]}
            selected={selectedMemberTab}
            onChange={setSelectedMemberTab}
            variant="outlined"
            theme="university"
            size={11}
            style={{ maxWidth: 350 }}
          />
          {selectedMemberTab === 'members' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <div style={{ marginLeft: 'auto' }}>
                <Switch
                  onChange={handleViewChange}
                  checked={viewType === 'grid'}
                  offColor={Theme.primaryHover}
                  onColor={Theme.primaryHover}
                  checkedIcon={
                    <div className={styles.switchIconWrapper}>
                      <BsGridFill />
                    </div>
                  }
                  uncheckedIcon={
                    <div className={styles.switchIconWrapper}>
                      <BsListUl />
                    </div>
                  }
                />
              </div>
            </div>
          )}
        </div>
        {selectedMemberTab === 'members'
          ? viewType === 'grid'
            ? renderGridViewMembers()
            : renderListViewMembers()
          : renderMemberRequests()}
      </div>
    );
  }

  return fetchErr ? (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 400, textAlign: 'left', marginTop: 10 }}>
        <RSText type="body" size={14} bold color={Theme.error}>
          There was an error getting the member data
        </RSText>
      </div>
    </div>
  ) : (
    <div>
      <RSModal
        open={showTitleModal}
        onClose={() => {
          setTitle('');
          setTitleUserID('');
          setShowTitleModal(false);
        }}
        title="Board Member Title"
        helperText="Give the board member a new title"
      >
        <div style={{ padding: 15 }}>
          <RSTextField
            label="Title"
            value={title}
            onChange={(e: any) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
            style={{ marginTop: 10 }}
          />

          <RSButton
            style={{ marginTop: 10, width: '100%' }}
            onClick={() => handleAddBoardMember(titleUserID, title)}
          >
            Save
          </RSButton>
        </div>
      </RSModal>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 50 }}>
        <RSButtonV2
          borderRadius={5}
          style={{ height: 30, width: 150, marginRight: 20 }}
          onClick={handleDownloadClicked}
        >
          <AiOutlineDownload
            size={20}
            color={Theme.white}
            style={{ paddingRight: 5 }}
          />
          <RSText size={10} color={Theme.white}>
            Download CSV
          </RSText>
        </RSButtonV2>
        {downloadMembers && (
          <CSVDownload
            data={downloadMembers}
            target="_blank"
            filename="rootshare-users.csv"
          />
        )}
        {/* <RSButtonV2 borderRadius={5} style={{ height: 30, width: 150 }}>
          <FiSend size={18} color={Theme.white} style={{ paddingRight: 5 }} />
          <RSText size={10} color={Theme.white}>
            Messaging
          </RSText>
        </RSButtonV2> */}
      </div>
      {renderBoardMembers()}
      {renderMembers()}
    </div>
  );
};
