import React, { useEffect, useState } from 'react';
import { Modal, Table, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { httpFetch } from '../helpers/http';

interface DisplayRecordsModalProps {
  open: boolean;
  name: string;
  headers: string[];
  handleDelete: (selectedRecordId: number) => void;
  handleClose: () => void;
}

const DisplayRecordsModal: React.FC<DisplayRecordsModalProps> = ({
  open,
  name,
  headers,
  handleDelete,
  handleClose,
}) => {
  const [recordsData, setRecordsData] = useState<any[]>([]);

  useEffect(() => {
    getRecords();
  }, []);

  function getRecords() {
    httpFetch('/api/records/user/' + name, 'GET')
      .then((response) => {
        setRecordsData(response.map((item: any, index: number) => {
          const newData = {
            ...item,
            'No': index + 1,
            'Name': item.name
          };

          newData[item.fieldName] = item.fieldValue;
          
          return newData;
        }));
      })
      .catch((error) => {
        console.log('Error getting records user data:', error);
      });
  }

  const handleDeleteRecord = (selectedId: number, selectedIndex: number) => {
    handleDelete(selectedId);
    getRecords();
    message.success('Record deleted successfully.');
  };

  const columns = headers.map((header: any, index) => ({
    title: header.header !== 'Rank' ? header.header : 'No',
    dataIndex: header.header !== 'Rank' ? header.header : 'No',
    key: header.header,
    width: '10%',
    align: 'center',
    render: (text: string, record: any) =>
      header.header === 'Actions' ? (
        <Button
          className='fill-red-500'
          type="link"
          onClick={() => handleDeleteRecord(record.id, index)}
          icon={<DeleteOutlined />}
        >
        </Button>
      ) : (
        text
      ),
  }));

  return (
    <Modal
      title="RECORDS"
      visible={open}
      onCancel={handleClose}
      footer={null}
      width={800}
    >
      <Table
        columns={columns}
        dataSource={recordsData}
        rowKey="id"
        bordered
        pagination={false}
      />
    </Modal>
  );
};

export default DisplayRecordsModal;
