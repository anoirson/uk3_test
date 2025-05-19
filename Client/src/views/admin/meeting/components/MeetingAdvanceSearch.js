import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter,
  Grid, GridItem, FormLabel, Input, Button, Text
} from '@chakra-ui/react';
import {
  setSearchValue,
  setGetTagValues,
  getSearchData
} from '../../../../redux/slices/advanceSearchSlice';
import { useDispatch } from 'react-redux';

const MeetingAdvanceSearch = ({
  allData,
  advanceSearch,
  setAdvanceSearch,
  setDisplaySearchData
}) => {
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      agenda: '',
      createBy: '',
      startDate: '',
      endDate: '',
      timeStartDate: '',
      timeEndDate: ''
    },
    validationSchema: yup.object({
      agenda: yup.string(),
      createBy: yup.string().email('Invalid email')
    }),
    onSubmit: (values, { resetForm }) => {
      dispatch(setSearchValue(values));
      dispatch(getSearchData({ values, allData, type: 'Meeting' }));

      const tags = [
        { name: ['agenda'], value: values.agenda },
        { name: ['createBy'], value: values.createBy },
        {
          name: ['startDate', 'endDate'],
          value:
            values.startDate || values.endDate
              ? `From: ${values.startDate} To: ${values.endDate}`
              : ''
        },
        {
          name: ['timeStartDate', 'timeEndDate'],
          value:
            values.timeStartDate || values.timeEndDate
              ? `From: ${values.timeStartDate} To: ${values.timeEndDate}`
              : ''
        }
      ].filter(t => t.value);

      dispatch(setGetTagValues(tags));
      setDisplaySearchData(true);
      setAdvanceSearch(false);
      resetForm();
    }
  });

  const {
    values, errors, touched,
    handleChange, handleBlur, handleSubmit, dirty
  } = formik;

  return (
    <Modal
      isOpen={advanceSearch}
      onClose={() => { setAdvanceSearch(false); formik.resetForm(); }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Advance Search</ModalHeader>
        <ModalCloseButton onClick={() => { setAdvanceSearch(false); formik.resetForm(); }} />
        <ModalBody>
          <Grid templateColumns="repeat(12,1fr)" gap={4}>
            <GridItem colSpan={6}>
              <FormLabel>Agenda</FormLabel>
              <Input
                name="agenda"
                value={values.agenda}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Search by agenda"
              />
              {errors.agenda && touched.agenda && (
                <Text color="red">{errors.agenda}</Text>
              )}
            </GridItem>

            <GridItem colSpan={6}>
              <FormLabel>Created By (email)</FormLabel>
              <Input
                name="createBy"
                value={values.createBy}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Search by creator email"
              />
              {errors.createBy && touched.createBy && (
                <Text color="red">{errors.createBy}</Text>
              )}
            </GridItem>

            <GridItem colSpan={6}>
              <FormLabel>Date From</FormLabel>
              <Input
                type="date"
                name="startDate"
                value={values.startDate}
                onChange={handleChange}
              />
            </GridItem>

            <GridItem colSpan={6}>
              <FormLabel>Date To</FormLabel>
              <Input
                type="date"
                name="endDate"
                min={values.startDate}
                value={values.endDate}
                onChange={handleChange}
              />
            </GridItem>

            <GridItem colSpan={6}>
              <FormLabel>Timestamp From</FormLabel>
              <Input
                type="date"
                name="timeStartDate"
                value={values.timeStartDate}
                onChange={handleChange}
              />
            </GridItem>

            <GridItem colSpan={6}>
              <FormLabel>Timestamp To</FormLabel>
              <Input
                type="date"
                name="timeEndDate"
                min={values.timeStartDate}
                value={values.timeEndDate}
                onChange={handleChange}
              />
            </GridItem>
          </Grid>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isDisabled={!dirty}
            mr={3}
          >
            Search
          </Button>
          <Button variant="outline" onClick={() => formik.resetForm()}>
            Clear
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MeetingAdvanceSearch;
