import "./style.less";

import React, { useMemo } from "react";
import { Table } from "antd";
import prettyBytes from "pretty-bytes";
import { format } from "date-fns";
import { FileOutlined } from "@ant-design/icons";
import { CloudStorageFileListHeadTip } from "../CloudStorageFileListHeadTip";
import { ColumnsType } from "antd/lib/table";

export interface CloudStorageFile {
    fileUUID: string;
    fileName: string;
    fileSize: number;
    createAt: Date;
}

export interface CloudStorageFileListProps {
    /** Cloud Storage List items */
    files: CloudStorageFile[];
    /** User selected file UUIDs */
    selectedFileUUIDs: string[];
    /** Fires when user select or deselect files */
    onSelectionChange: (fileUUID: string[]) => void;
}

/**
 * Render a table list of Cloud Storage items.
 */
export const CloudStorageFileList: React.FC<CloudStorageFileListProps> = ({
    files,
    selectedFileUUIDs,
    onSelectionChange,
}) => {
    const columns = useMemo<ColumnsType<CloudStorageFile>>(
        () => [
            {
                title: (
                    <>
                        文件名称{" "}
                        <CloudStorageFileListHeadTip
                            title="支持上传 PPT、PPTX、DOC、DOCX、PDF、PNG、JPG、GIF 文件格式"
                            placement="right"
                        />
                    </>
                ),
                dataIndex: "fileName",
                ellipsis: true,
                render: function renderCloudStorageFileName(
                    fileName: CloudStorageFile["fileName"],
                ) {
                    return (
                        <span className="cloud-storage-file-list-name" title={fileName}>
                            <FileOutlined /> {fileName}
                        </span>
                    );
                },
            },
            {
                title: "大小",
                dataIndex: "fileSize",
                ellipsis: true,
                width: "20%",
                render: function renderCloudStorageFileSize(
                    fileSize: CloudStorageFile["fileSize"],
                ) {
                    const formattedSize = prettyBytes(fileSize);
                    return <span title={formattedSize}>{formattedSize}</span>;
                },
            },
            {
                title: "修改日期",
                dataIndex: "createAt",
                ellipsis: true,
                width: "20%",
                render: function renderCloudStorageCreateAt(date: CloudStorageFile["createAt"]) {
                    const formattedDate = format(date, "yyyy/MM/dd HH:mm:ss");
                    return <span title={formattedDate}>{formattedDate}</span>;
                },
            },
        ],
        [],
    );

    return (
        <Table
            className="cloud-storage-file-list-table"
            columns={columns}
            dataSource={files}
            rowKey="fileUUID"
            pagination={false}
            rowSelection={{
                selectedRowKeys: selectedFileUUIDs,
                onChange: onSelectionChange as (keys: React.Key[]) => void,
            }}
        />
    );
};
