interface Leaderboards {
  rank?: number;
  name: string;
  data: string | Record<string, any>;
}

interface Records {
  id?: number;
  name: string;
  data: string | Record<string, any>;
}

interface RecordsValue {
  fieldName: string;
  type: string;
  value: string;
}

interface Field {
  id?: number;
  name: string;
  mechanism: string;
  sort: string;
  type: string;
  priority: number;
}

interface FieldValue {
  fieldId?: number;
  fieldName: string;
  type?: string;
  value: string;
}