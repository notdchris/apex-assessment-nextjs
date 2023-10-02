import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Modal,
  Select,
  Row,
  Col,
  notification,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { httpFetch } from '../helpers/http';

const { Option } = Select;

const mechanismOptions = ['SUM', 'MAX', 'MIN'];
const sortOptions = ['ASC', 'DESC'];
const typeOptions = ['TEXT', 'NUMBER'];

interface Field {
  id?: number;
  name: string;
  mechanism: string;
  sort: string;
  type: string;
  priority: number;
}

interface FieldModalProps {
  open: boolean;
  handleClose: () => void;
  handleSave: (fieldData: Field[]) => void;
}

const AddFieldModal: React.FC<FieldModalProps> = ({ open, handleSave, handleClose }) => {
  const [fieldData, setFieldData] = useState<Field[]>([]);

  useEffect(() => {
    fetchFieldData();
  }, []);

  async function fetchFieldData() {
    httpFetch('/api/fields', 'GET')
      .then((response) => {
        setFieldData(response.sort((a: any, b: any) => a.priority - b.priority));
      })
      .catch((error) => {
        console.log('Error getting field data:', error);
      });
  }

  async function deleteFieldData(id: number) {
    httpFetch('/api/fields/' + id, 'DELETE')
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log('Error getting field data:', error);
      });
  }

  const handleAddField = () => {
    const newField: Field = {
      name: '',
      mechanism: '',
      sort: '',
      type: '',
      priority: fieldData.length + 1,
    };

    setFieldData([...fieldData, newField]);
  };

  const handleSaveFields = () => {
    const emptyFieldsIndexes: number[] = [];

    fieldData.forEach((field, index) => {
      if (
        field.name.trim() === '' ||
        field.mechanism.trim() === '' ||
        field.sort.trim() === '' ||
        field.type.trim() === ''
      ) {
        emptyFieldsIndexes.push(index);
      }
    });

    if (emptyFieldsIndexes.length > 0) {
      notification.error({
        message: 'Error',
        description: 'Please fill in all the fields.',
      });
    } else {
      handleSave(fieldData);
    }
  };

  const handleDeleteField = (selectedIndex: number) => {
    const selectedIds = Number(fieldData[selectedIndex]?.id);

    if (selectedIds) {
      deleteFieldData(selectedIds);
    }
    
    const updatedFieldData = fieldData.filter((_, index) => index !== selectedIndex);
    setFieldData(updatedFieldData);
  };

  const handleMoveField = (selectedIndex: number, direction: 'up' | 'down') => {
    const updatedFieldData = [...fieldData];
    const fieldToMove = updatedFieldData[selectedIndex];

    if (direction === 'up' && selectedIndex > 0) {
      updatedFieldData[selectedIndex] = updatedFieldData[selectedIndex - 1];
      updatedFieldData[selectedIndex - 1] = fieldToMove;
    } else if (direction === 'down' && selectedIndex < updatedFieldData.length - 1) {
      updatedFieldData[selectedIndex] = updatedFieldData[selectedIndex + 1];
      updatedFieldData[selectedIndex + 1] = fieldToMove;
    }

    updatedFieldData.forEach((field, index) => {
      field.priority = index + 1;
    });

    setFieldData(updatedFieldData);
  };

  return (
    <Modal
      title="Field Configuration"
      visible={open}
      onOk={handleSaveFields}
      okText='Save'
      okType='default'
      onCancel={handleClose}
      width={800}
    >
      <div className="space-y-4">
        {fieldData.map((value, index) => (
          <div
            key={index}
            className="border border-solid border-gray-300 p-4 rounded-md"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Field {index + 1}</h4>
              <div>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteField(index)}
                />
                <Button
                  type="text"
                  icon={<ArrowUpOutlined />}
                  onClick={() => handleMoveField(index, 'up')}
                  disabled={index === 0}
                />
                <Button
                  type="text"
                  icon={<ArrowDownOutlined />}
                  onClick={() => handleMoveField(index, 'down')}
                  disabled={index === fieldData.length - 1}
                />
              </div>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <label className="block text-gray-700 text-sm">Name</label>
                <Input
                  placeholder="Name"
                  value={value.name}
                  onChange={(event) => {
                    const updatedFieldData = [...fieldData];
                    updatedFieldData[index].name = event.target.value;
                    setFieldData(updatedFieldData);
                  }}
                />
              </Col>
              <Col span={12}>
                <div className="flex flex-col">
                  <label className="block text-gray-700 text-sm">Mechanism</label>
                  <Select
                    placeholder="Mechanism"
                    value={value.mechanism}
                    onChange={(newValue) => {
                      const updatedFieldData = [...fieldData];
                      updatedFieldData[index].mechanism = newValue;
                      setFieldData(updatedFieldData);
                    }}
                  >
                    {mechanismOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div className="flex flex-col">
                  <label className="block text-gray-700 text-sm">Sort</label>
                  <Select
                    placeholder="Sort"
                    value={value.sort}
                    onChange={(newValue) => {
                      const updatedFieldData = [...fieldData];
                      updatedFieldData[index].sort = newValue;
                      setFieldData(updatedFieldData);
                    }}
                  >
                    {sortOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div className="flex flex-col">
                  <label className="block text-gray-700 text-sm">Data Type</label>
                  <Select
                    placeholder="Data Type"
                    value={value.type}
                    onChange={(newValue) => {
                      const updatedFieldData = [...fieldData];
                      updatedFieldData[index].type = newValue;
                      setFieldData(updatedFieldData);
                    }}
                  >
                    {typeOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            </Row>
          </div>
        ))}
        <div className="text-right">
          <Button
            className='bg-button'
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddField}
          >
            Add Field
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddFieldModal;
