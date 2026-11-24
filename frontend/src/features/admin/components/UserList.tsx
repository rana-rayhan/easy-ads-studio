import moment from "moment";
import type { ColumnsType } from "antd/es/table";
import { useState, useMemo, memo } from "react";
import { Card, Input, Space, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import useUserHook from "../hooks/useUserHook";
import { Loading } from "../../components/Loading";
import { filteredUsers } from "../../../shared/utils/searchFilterUtils";
import { customConsoleLogForDev } from "../../../shared/logHelpers/logger";

const UserList = ({ pageSize = 10 }: { pageSize: number }) => {
  const { users, isLoadingUsers } = useUserHook();
  const [searchText, setSearchText] = useState<string>("");
  // Memoized filter function for performance
  const filteredUsersData = useMemo(() => filteredUsers(users, searchText), [searchText, users]);

  const userColumns: ColumnsType<IUserDetails> = [
    {
      title: "Full Name",
      dataIndex: "firstName",
      key: "firstName",
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("ll"),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  customConsoleLogForDev("user list");

  return (
    <Card
      title="User Management"
      extra={
        <Space>
          <Input.Search
            placeholder="Search users"
            allowClear
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
        </Space>
      }
    >
      {isLoadingUsers ? (
        <Loading />
      ) : (
        <Table
          columns={userColumns}
          dataSource={filteredUsersData}
          rowKey="id"
          pagination={{ pageSize }}
          scroll={{ x: 200 }}
          bordered
        />
      )}
    </Card>
  );
};

export default memo(UserList);
