import { RecordInstance } from "../data/types";
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalBody,
  Flex,
  Text,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  IconButton,
  Box,
  Spacer,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { deleteRecord } from "../data/api";

interface Props {
  viewRecordDisclosure: any;
  openRecordInstance: RecordInstance | undefined;
}

export const ViewRecordInstanceModal = ({
  viewRecordDisclosure,
  openRecordInstance,
}: Props) => {
  const getKeys = (): string[] => {
    let keys: string[] = [];
    openRecordInstance?.data.forEach((dataPoint) => {
      Object.keys(dataPoint).forEach((dpKey) => {
        if (!keys.includes(dpKey)) keys.push(dpKey);
      });
    });
    console.log("keys", keys);
    return keys;
  };

  const deleteMutation = useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      viewRecordDisclosure.onClose();
    },
  });

  return (
    <Modal
      isOpen={viewRecordDisclosure.isOpen}
      onClose={viewRecordDisclosure.onClose}
      scrollBehavior={"inside"}
      size={"6xl"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>View Recording</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex>
            <Box>
              <Flex gap={5}>
                <Text>
                  <b>Record ID:</b> {openRecordInstance?.uniqueID}
                </Text>
                <Text>
                  <b>Micro:bit ID:</b> {openRecordInstance?.deviceID}
                </Text>
              </Flex>

              <Text>
                <b>Class:</b> {openRecordInstance?.classification}
              </Text>

              <Text>
                <b>Number of Data Points: </b> {openRecordInstance?.data.length}
              </Text>
            </Box>
            <Spacer />
            <IconButton
              aria-label={"Delete"}
              icon={<DeleteIcon />}
              colorScheme={"red"}
              isLoading={deleteMutation.isLoading}
              onClick={() => {
                console.log("delete");
                if (openRecordInstance !== undefined)
                  deleteMutation.mutate(openRecordInstance.uniqueID);
              }}
            />
          </Flex>

          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  {getKeys().map((k) => {
                    return <Th>{k}</Th>;
                  })}
                </Tr>
              </Thead>
              <Tbody>
                {openRecordInstance?.data.map((dataPoint) => {
                  return (
                    <Tr>
                      {Object.values(dataPoint).map((d) => {
                        return <Td>{d}</Td>;
                      })}
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
