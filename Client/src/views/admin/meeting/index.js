import React, { useEffect, useState, useCallback } from 'react';
import {
  Button, Text, useDisclosure,  Flex,
  Box
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { CiMenuKebab } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import CommonCheckTable from '../../../components/reactTable/checktable';
import CommonDeleteModel from '../../../components/commonDeleteModel';
import AddMeeting from './components/Addmeeting';
import MeetingAdvanceSearch from './components/MeetingAdvanceSearch';
import { getApi, postApi } from '../../../services/api';
import { toast } from 'react-toastify';
import { HasAccess } from '../../../redux/accessUtils';
import { fetchMeetingData } from '../../../redux/slices/meetingSlice';
import { useDispatch, useSelector } from 'react-redux';

const MeetingIndex = () => {
    const dispatch = useDispatch();
    const { data: meetings, isLoading } = useSelector(state => state.meetingData);
  
    const [selectedValues, setSelectedValues] = useState([]);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [tagValues, setTagValues] = useState([]);
    const [searchBox, setSearchBox] = useState('');
  
    const [perm] = HasAccess(['Meetings']);
    const { isOpen, onOpen, onClose } = useDisclosure();
  
    const loadData = useCallback(() => {
      dispatch(fetchMeetingData());
    }, [dispatch]);
  
    useEffect(() => {
      loadData();
    }, [loadData]);
  
    const handleBulkDelete = async () => {
      try {
        const res = await postApi('api/meeting/deleteMany', selectedValues);
        toast.success(`Deleted ${res.data.count} meetings`);
        setSelectedValues([]);
        setIsDeleteOpen(false);
        loadData();
      } catch {
        toast.error('Failed to delete');
      }
    };
  
    const columns = [
      { Header: '#', accessor: '_id', isSortable: false, width: 50 },
      {
        Header: 'Agenda',
        accessor: 'agenda',
        cell: ({ row }) => (
          <Link to={`/meeting/${row.values._id}`}>
            <Text color="brand.600" _hover={{ textDecoration: 'underline' }}>
              {row.values.agenda}
            </Text>
          </Link>
        )
      },
      { Header: 'Date & Time', accessor: 'dateTime' },
      { Header: 'Created By', accessor: 'createBy.username' },
      perm.delete && {
        Header: 'Actions',
        isSortable: false,
        cell: ({ row }) => (
          <CiMenuKebab
            cursor="pointer"
            onClick={() => {
              setSelectedValues([row.values._id]);
              setIsDeleteOpen(true);
            }}
          />
        )
      }
    ].filter(Boolean);
  
    const tableData = showSearchResults ? searchResults : meetings;
  
    return (
      <Box p={4}>
        {/* Add Meeting Modal */}
        <AddMeeting
          isOpen={isOpen}
          onClose={onClose}
          fetchData={loadData}
        />
  
        {/* Toolbar */}
        <Flex mb={4} align="center" justify="flex-end" wrap="wrap" gap={2}>
          <Button
            leftIcon={<SearchIcon />}
            size="sm"
            variant="outline"
            onClick={() => setIsAdvanceOpen(true)}
          >
            Advance Search
          </Button>
  
          <Button
            leftIcon={<DeleteIcon />}
            size="sm"
            colorScheme="red"
            isDisabled={selectedValues.length === 0}
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete Selected
          </Button>
  
          <Button
            colorScheme="brand"
            size="sm"
            onClick={onOpen}
            isDisabled={!perm.create}
          >
            + Add New
          </Button>
        </Flex>
  
        {/* Data Table */}
        <CommonCheckTable
          title="Meetings"
          isLoding={isLoading}
          columnData={columns}
          allData={tableData}
          tableData={tableData}
            
          checkBox
          deleteMany
          selectedValues={selectedValues}
          setSelectedValues={setSelectedValues}
  
          searchDisplay={showSearchResults}
          setSearchDisplay={setShowSearchResults}
          searchedDataOut={searchResults}
          setSearchedDataOut={setSearchResults}
          getTagValuesOutSide={tagValues}
          setGetTagValuesOutside={setTagValues}
          searchboxOutside={searchBox}
          setSearchboxOutside={setSearchBox}
          AdvanceSearch={
            <MeetingAdvanceSearch
              allData={meetings}
              advanceSearch={isAdvanceOpen}
              setAdvanceSearch={setIsAdvanceOpen}
              setDisplaySearchData={setShowSearchResults}
              setSearchedData={setSearchResults}
            />
          }
  
          onOpen={onOpen}
          access={perm}
          setDelete={setIsDeleteOpen}
          tableCustomFields={[]}   
        />
  
        {/* Bulk Delete Confirmation */}
        <CommonDeleteModel
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          type="Meetings"
          handleDeleteData={handleBulkDelete}
          ids={selectedValues}
        />
      </Box>
    );
  };
  
  export default MeetingIndex;
  
  