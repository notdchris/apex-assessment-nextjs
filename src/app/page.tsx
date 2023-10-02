'use client'
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Table, Space } from 'antd';
import { SearchOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';

import AddFieldModal from '@/app/components/add-field-modal';
import AddRecordModal from '@/app/components/add-record-modal';
import DisplayRecordsModal from '@/app/components/display-record-modal';
import { httpFetch } from './helpers/http';

const PAGE_SIZE = 10;

interface Header {
  header: string;
  id: string | number;
}

export default function Home() {
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isAddRecordsModalOpen, setIsAddRecordsModalOpen] = useState(false);
  const [isDisplayRecordsModalOpen, setIsDisplayRecordsModalOpen] = useState(false);
  const [displayRecordName, setDisplayRecordName] = useState('');
  const [headers, setHeaders] = useState<Header[]>([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchFieldData();
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
  }, [currentPage, PAGE_SIZE]);

  const openFieldsModal = useCallback(() => {
    setIsFieldModalOpen(true);
  }, []);

  function fetchFieldData() {
    httpFetch('/api/fields', 'GET')
      .then((response) => {
        setHeaders([
          {
            'header' : 'Rank',
            'id' : 'rank'
          }, 
          {
            'header' : 'Name',
            'id' : 'name'
          }, ...response.map((item: Field) => {
            return {
              'header' : item.name,
              'id' : item.id
            }
          }), {
            'header' : 'Actions',
            'id' : 'actions'
          }
        ]);
        fetchLeaderboardData();
      })
      .catch((error) => {
        console.log('Error getting field data:', error);
      });
  }

  function fetchLeaderboardData() {
    httpFetch('/api/leaderboards', 'GET', { page: currentPage, pageSize: PAGE_SIZE })
      .then((response) => {
        setLeaderboardData(response.data.map((item: any) => {
          const newData = {
            ...item,
            rank: item.id,
            name: item.name
          };

          item.data.forEach((item: any) => {
            newData[item.fieldId] = item.totalValue;
          })
          
          return newData;
        }));
        setTotalPages(response.totalPages);
      })
      .catch((error) => {
        console.log('Error getting leaderboard data:', error);
      });
  }

  const handleSaveField = useCallback(async (fieldData: any) => {
    httpFetch('/api/fields', 'POST', fieldData)
      .then((response) => {
        setIsFieldModalOpen(false);
        fetchFieldData();
      })
      .catch((error) => {
        console.log('Error creating field data:', error);
      });
  }, []);

  const closeFieldsModal = useCallback(() => {
    setIsFieldModalOpen(false);
  }, []);

  const openAddRecordsModal = useCallback(() => {
    setIsAddRecordsModalOpen(true);
  }, []);

  const handleSaveRecords = useCallback((records: any) => {
    httpFetch('/api/records', 'POST', records)
      .then((response) => {
        fetchLeaderboardData();
        setIsAddRecordsModalOpen(false);
      })
      .catch((error) => {
        console.log('Error creating records:', error);
      });
  }, [headers]);

  const closeAddRecordsModal = useCallback(() => {
    setIsAddRecordsModalOpen(false);
  }, []);

  const openDisplayRecordsModal = useCallback((name: string) => {
    setDisplayRecordName(name);
    setIsDisplayRecordsModalOpen(true);
  }, []);

  const handleDeleteRecords = useCallback((id: number) => {
    httpFetch('/api/records/' + id, 'DELETE')
      .then((response) => {
        fetchLeaderboardData();
      })
      .catch((error) => {
        console.log('Error deleting record:', error);
      });
  }, []);

  const closeDisplayRecordsModal = useCallback(() => {
    setIsDisplayRecordsModalOpen(false);
  }, []);

  const columns = headers.map((header: Header) => ({
    title: header.header,
    dataIndex: header.id,
    key: header.id,
    align: 'center',
    render: (text: string, record: any) => {
      if (header.header === 'Actions') {
        return (
          <Space>
            <Button
              icon={<SearchOutlined />}
              onClick={() => openDisplayRecordsModal(record['name'])}
            >
            </Button>
          </Space>
        );
      }
      return text;
    },
  }));

  return (
    <main className="flex flex-col item-center justify-center text-black w-full">
      <div className="text-right">
        <div className="m-2">
          <Button
            className="bg-gray-200 ml-2"
            onClick={openFieldsModal}
          >
            FIELDS
          </Button>
          <Button
            className="bg-button ml-2"
            type="primary"
            onClick={openAddRecordsModal}
          >
            ADD ENTRY
          </Button>
        </div>
      </div>

      {isFieldModalOpen && (
        <AddFieldModal
          open={isFieldModalOpen}
          handleSave={handleSaveField}
          handleClose={closeFieldsModal}
        />
      )}
      {isAddRecordsModalOpen && (
        <AddRecordModal
          open={isAddRecordsModalOpen}
          handleSave={handleSaveRecords}
          handleClose={closeAddRecordsModal}
        />
      )}

      <Table
        dataSource={leaderboardData}
        columns={columns}
        pagination={false}
        rowKey="Rank"
        bordered
      />

      <div className="mt-4 mb-4 flex justify-center">
        <Button
          className="bg-button"
          type="primary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prevPage) => prevPage - 1)}
        >
          <ArrowLeftOutlined />
        </Button>
        {Array.from({ length: totalPages }, (_, index) => (
          <Button
            key={index}
            className={`ml-2 ${
              currentPage === index + 1 ? 'bg-button active' : 'bg-zinc-500'
            }`}
            type="primary"
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </Button>
        ))}
        <Button
          className="ml-2 bg-button"
          type="primary"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
        >
          <ArrowRightOutlined />
        </Button>
      </div>

      {isDisplayRecordsModalOpen && (
        <DisplayRecordsModal
          open={isDisplayRecordsModalOpen}
          name={displayRecordName}
          headers={headers}
          handleDelete={handleDeleteRecords}
          handleClose={closeDisplayRecordsModal}
        />
      )}
    </main>
  );
}
