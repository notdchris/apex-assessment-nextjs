import React, { useEffect, useState } from 'react';
import { Modal, Input, message, Row, Col } from 'antd';
import { httpFetch } from '../helpers/http';

interface AddRecordsModalProps {
  open: boolean;
  handleClose: () => void;
  handleSave: (record: Records) => void;
}

const AddRecordModal: React.FC<AddRecordsModalProps> = ({
  open,
  handleSave,
  handleClose,
}) => {
  const [name, setName] = useState('');
  const [fieldValue, setFieldValue] = useState<FieldValue[]>([]);

  useEffect(() => {
    httpFetch('/api/fields', 'GET')
      .then((response: Field[]) => {
        const sortedField = response
          .sort((a: Field, b: Field) => a.priority - b.priority)
          .map(({ id, name, type }) => ({
            fieldId: id,
            fieldName: name,
            type: type,
            value: '',
          }));
        setFieldValue(sortedField);
      })
      .catch((error: any) => {
        console.log('Error getting field data:', error);
      });
  }, []);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setName(event.target.value);
  };

  const handleValueChange = (fieldId: number | undefined, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updatedRecords = fieldValue.map((entry) => {
      if (entry.fieldId === fieldId) {
        return { ...entry, value: event.target.value };
      }
      return entry;
    });
    setFieldValue(updatedRecords);
  };

  const handleSaveRecord = () => {
    if (name.trim() === '') {
      message.error('Please fill in the Name field.');
    } else {
      const record: Records = {
        name: name,
        data: JSON.stringify(fieldValue),
      };

      handleSave(record);
    }
  };

  return (
    <Modal
      title="Add Entry"
      open={open}
      onOk={handleSaveRecord}
      okText='Save'
      okType='default'
      onCancel={handleClose}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Input
            autoFocus
            placeholder="Name"
            value={name}
            onChange={handleNameChange}
          />
        </Col>
        {fieldValue.map((field, index) => (
          <Col className='mt-2' span={24} key={index}>
            {field.type === 'TEXT' && (
              <Input
                placeholder={field.fieldName}
                value={field.value}
                onChange={(event) => handleValueChange(field.fieldId, event)}
              />
            )}
            {field.type === 'NUMBER' && (
              <Input
                placeholder={field.fieldName}
                type="number"
                value={field.value}
                onChange={(event) => handleValueChange(field.fieldId, event)}
              />
            )}
          </Col>
        ))}
      </Row>
    </Modal>
  );
};

export default AddRecordModal;
