import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { CloudStorageFileList } from "./CloudStorageFileList";

export interface CloudStorageProps {}

// sssx

export const CloudStorage = observer<CloudStorageProps>(function CloudStorage() {
    // @ts-ignore
    return <CloudStorageFileList files={[]} />;
});
