import React, { useEffect, useState } from 'react';
import {
  Button, Flex, FormLabel, Grid, GridItem,
  IconButton, Input, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader, ModalOverlay, Radio, RadioGroup,
  Stack, Text, Textarea
} from '@chakra-ui/react';
import { CUIAutoComplete } from 'chakra-ui-autocomplete';
import { LiaMousePointerSolid } from 'react-icons/lia';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import MultiContactModel from '../../../../components/commonTableModel/MultiContactModel';
import MultiLeadModel from '../../../../components/commonTableModel/MultiLeadModel';
import { MeetingSchema } from '../../../../schema/meetingSchema';
import { getApi, postApi } from '../../../../services/api';
import { toast } from 'react-toastify';

const AddMeeting = ({ isOpen, onClose, fetchData }) => {
  const [contactModelOpen, setContactModel] = useState(false);
  const [leadModelOpen, setLeadModel] = useState(false);
  const [contactData, setContactData] = useState([]);
  const [leadData, setLeadData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const todayTime = new Date().toISOString().split('.')[0];

  // load contacts & leads for multi‐select
  useEffect(() => {
    (async () => {
      try {
        const cRes = await getApi('api/contact');
        if (cRes.data.success) setContactData(cRes.data.data);
        const lRes = await getApi('api/lead');
        if (lRes.data.success) setLeadData(lRes.data.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const formik = useFormik({
    initialValues: {
      agenda: '',
      attendes: [],
      attendesLead: [],
      location: '',
      related: 'None',
      dateTime: '',
      notes: '',
    },
    validationSchema: MeetingSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      try {
        await postApi('api/meeting/add', values);
        toast.success('Meeting created');
        resetForm();
        onClose();
        fetchData();
      } catch (err) {
        toast.error('Failed to create meeting');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const {
    errors, touched, values,
    handleBlur, handleChange,
    handleSubmit, setFieldValue
  } = formik;

  const options = (values.related === 'Contact' ? contactData : leadData).map(item => ({
    value: item._id,
    label: values.related === 'Contact'
      ? `${item.firstName} ${item.lastName}`
      : item.leadName,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent maxH="80vh">
        <ModalHeader>Add Meeting</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto">
          <MultiContactModel
            data={contactData}
            isOpen={contactModelOpen}
            onClose={() => setContactModel(false)}
            fieldName="attendes"
            setFieldValue={setFieldValue}
          />
          <MultiLeadModel
            data={leadData}
            isOpen={leadModelOpen}
            onClose={() => setLeadModel(false)}
            fieldName="attendesLead"
            setFieldValue={setFieldValue}
          />

          <Grid templateColumns="repeat(12,1fr)" gap={4}>
            {/* Agenda */}
            <GridItem colSpan={12}>
              <FormLabel>Agenda<Text color="red">*</Text></FormLabel>
              <Input
                name="agenda"
                placeholder="Agenda"
                value={values.agenda}
                onChange={handleChange}
                onBlur={handleBlur}
                borderColor={errors.agenda && touched.agenda ? 'red.300' : undefined}
              />
              {errors.agenda && touched.agenda && (
                <Text color="red">{errors.agenda}</Text>
              )}
            </GridItem>

            {/* Related */}
            <GridItem colSpan={12}>
              <FormLabel>Related To<Text color="red">*</Text></FormLabel>
              <RadioGroup
                value={values.related}
                onChange={val => setFieldValue('related', val)}
              >
                <Stack direction="row">
                  <Radio value="Contact">Contact</Radio>
                  <Radio value="Lead">Lead</Radio>
                </Stack>
              </RadioGroup>
              {errors.related && touched.related && (
                <Text color="red">{errors.related}</Text>
              )}
            </GridItem>

            {/* Attendees */}
            <GridItem colSpan={12}>
              <Flex align="center" justify="space-between">
                <CUIAutoComplete
                  label={`Choose ${values.related}`}
                  placeholder="Type to search..."
                  items={options}
                  selectedItems={options.filter(o =>
                    (values.related === 'Contact'
                      ? values.attendes
                      : values.attendesLead).includes(o.value)
                  )}
                  onSelectedItemsChange={({ selectedItems }) => {
                    const ids = selectedItems.map(i => i.value);
                    if (values.related === 'Contact') {
                      setFieldValue('attendes', ids);
                    } else {
                      setFieldValue('attendesLead', ids);
                    }
                  }}
                />
                <IconButton
                  icon={<LiaMousePointerSolid />}
                  onClick={() =>
                    values.related === 'Contact'
                      ? setContactModel(true)
                      : setLeadModel(true)
                  }
                />
              </Flex>
              {values.related === 'Contact'
                ? errors.attendes && touched.attendes && (
                  <Text color="red">{errors.attendes}</Text>
                )
                : errors.attendesLead && touched.attendesLead && (
                  <Text color="red">{errors.attendesLead}</Text>
                )}
            </GridItem>

            {/* Location */}
            <GridItem colSpan={12}>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                placeholder="Location"
                value={values.location}
                onChange={handleChange}
                onBlur={handleBlur}
                borderColor={errors.location && touched.location ? 'red.300' : undefined}
              />
              {errors.location && touched.location && (
                <Text color="red">{errors.location}</Text>
              )}
            </GridItem>

            {/* Date & Time */}
            <GridItem colSpan={12}>
              <FormLabel>Date & Time<Text color="red">*</Text></FormLabel>
              <Input
                type="datetime-local"
                name="dateTime"
                min={dayjs(todayTime).format('YYYY-MM-DDTHH:mm')}
                value={values.dateTime}
                onChange={handleChange}
                onBlur={handleBlur}
                borderColor={errors.dateTime && touched.dateTime ? 'red.300' : undefined}
              />
              {errors.dateTime && touched.dateTime && (
                <Text color="red">{errors.dateTime}</Text>
              )}
            </GridItem>

            {/* Notes */}
            <GridItem colSpan={12}>
              <FormLabel>Notes</FormLabel>
              <Textarea
                name="notes"
                placeholder="Notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                borderColor={errors.notes && touched.notes ? 'red.300' : undefined}
              />
              {errors.notes && touched.notes && (
                <Text color="red">{errors.notes}</Text>
              )}
            </GridItem>
          </Grid>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={isLoading}
            mr={3}
          >
            Save
          </Button>
          <Button variant="outline" onClick={() => { formik.resetForm(); onClose(); }}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddMeeting;
