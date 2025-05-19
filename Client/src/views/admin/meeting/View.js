import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
} from "@chakra-ui/react";
import { IoIosArrowBack } from "react-icons/io";
import { DeleteIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import { getApi, deleteApi } from "../../../services/api";
import Spinner from "../../../components/spinner/Spinner";
import moment from "moment";
import CommonDeleteModel from "../../../components/commonDeleteModel";
import html2pdf from "html2pdf.js";
import { HasAccess } from "../../../redux/accessUtils";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [perm] = HasAccess(["Meetings"]);

  // fetch once on mount
  useEffect(() => {
    getApi("api/meeting/view/", id)
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    await deleteApi("api/meeting/delete/", id);
    navigate(-1);
  };

  const printPDF = () => {
    setPdfLoading(true);
    const el = document.getElementById("meetingReport");
    if (!el) {
      setPdfLoading(false);
      return;
    }
    html2pdf()
      .from(el)
      .set({
        margin: 0,
        filename: `Meeting_${moment().format("YYYYMMDD")}.pdf`,
        html2canvas: { scale: 2 },
      })
      .save()
      .finally(() => setPdfLoading(false));
  };

  // bail out early if still loading or no data
  if (loading || !data) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Spinner />
      </Flex>
    );
  }

  // pick the right attendee list, default to empty array
  const attendees =
    data.related === "Contact" ? data.attendes || [] : data.attendesLead || [];

  return (
    <Box p={5}>
      <Grid id="meetingReport" templateColumns="repeat(2,1fr)" gap={4}>
        <GridItem colSpan={2}>
          <Heading>{data.agenda}</Heading>
        </GridItem>
        <GridItem>
          <Text>
            <strong>Date & Time:</strong> {moment(data.dateTime).format("LLLL")}
          </Text>
        </GridItem>
        <GridItem>
          <Text>
            <strong>Created By:</strong> {data.createBy.username}
          </Text>
        </GridItem>
        <GridItem>
          <Text>
            <strong>Location:</strong> {data.location || "–"}
          </Text>
        </GridItem>
        <GridItem colSpan={2}>
          <Text>
            <strong>Notes:</strong> {data.notes || "–"}
          </Text>
        </GridItem>
        <GridItem colSpan={2}>
          <Text fontWeight="bold">Attendees:</Text>
          {attendees.length ? (
            attendees.map((item) => (
              <Text key={item._id}>
                {data.related === "Contact"
                  ? `${item.firstName} ${item.lastName}`
                  : item.leadName}
              </Text>
            ))
          ) : (
            <Text>–</Text>
          )}
        </GridItem>
      </Grid>

      <Flex justify="space-between" mt={4}>
        <Button leftIcon={<IoIosArrowBack />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Box>
          <Button mr={2} onClick={printPDF} isLoading={pdfLoading}>
            Print PDF
          </Button>
          {(perm.delete ||
            data.createBy._id ===
              JSON.parse(localStorage.getItem("user"))._id) && (
            <Button
              colorScheme="red"
              leftIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
        </Box>
      </Flex>

      <CommonDeleteModel
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        type="Meetings"
        handleDeleteData={handleDelete}
        ids={[id]}
      />
    </Box>
  );
};

export default View;
