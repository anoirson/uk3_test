import React, { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, DrawerFooter,
  IconButton, Flex, Grid, GridItem, Text
} from '@chakra-ui/react';
import { CloseIcon, ViewIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { getApi, deleteApi } from '../../../services/api';
import Spinner from '../../../components/spinner/Spinner';
import moment from 'moment';
import { Link, useNavigate } from 'react-router-dom';
import { HasAccess } from '../../../redux/accessUtils';

const MeetingView = ({ isOpen, onClose, meetingId, fetchData }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [perm] = HasAccess(['Meetings']);

  useEffect(() => {
    if (!meetingId) return;
    setLoading(true);
    getApi('api/meeting/view/', meetingId)
      .then(res => {
        setData(res.data.data)
    })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [meetingId]);


  const handleDelete = async () => {
    await deleteApi('api/meeting/delete/', meetingId);
    onClose();
    fetchData();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display="flex" justifyContent="space-between">
          Meeting Details
          <IconButton icon={<CloseIcon />} onClick={onClose} />
        </ModalHeader>
        {loading ? (
          <Flex p={10} justify="center"><Spinner /></Flex>
        ) : data ? (
          <>
            <ModalBody>
              <Grid templateColumns="repeat(2,1fr)" gap={4}>
                <GridItem>
                  <Text fontWeight="bold">Agenda</Text>
                  <Text>{data.agenda}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Date & Time</Text>
                  <Text>{moment(data.dateTime).format('lll')}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Created By</Text>
                  <Text>{data.createBy.username}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Location</Text>
                  <Text>{data.location || '-'}</Text>
                </GridItem>
                <GridItem colSpan={2}>
                  <Text fontWeight="bold">Notes</Text>
                  <Text>{data.notes || '-'}</Text>
                </GridItem>
                <GridItem colSpan={2}>
                  <Text fontWeight="bold">Attendees</Text>
                  {data.related === 'Contact'
                    ? data.attendes.map(c => (
                      <Link key={c._id} to={`/contactView/${c._id}`}>
                        <Text color="brand.600">{c.firstName} {c.lastName}</Text>
                      </Link>
                    ))
                    : data.attendesLead.map(l => (
                      <Link key={l._id} to={`/leadView/${l._id}`}>
                        <Text color="brand.600">{l.leadName}</Text>
                      </Link>
                    ))}
                </GridItem>
              </Grid>
            </ModalBody>
            <DrawerFooter>
              {perm.view && (
                <IconButton
                  aria-label="Open full"
                  icon={<ViewIcon />}
                  onClick={() => navigate(`/meeting/${meetingId}`)}
                />
              )}
              {perm.update && <IconButton icon={<EditIcon />} />}
              {perm.delete && (
                <IconButton
                  colorScheme="red"
                  icon={<DeleteIcon />}
                  onClick={handleDelete}
                />
              )}
            </DrawerFooter>
          </>
        ) : null}
      </ModalContent>
    </Modal>
  );
};

export default MeetingView;
