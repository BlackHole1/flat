import React, { useCallback, useState } from "react";
import classNames from "classnames";

import ToolBox from "@netless/tool-box";
import RedoUndo from "@netless/redo-undo";
import PageController from "@netless/page-controller";
import ZoomController from "@netless/zoom-controller";
import OssUploadButton, { UploadType } from "@netless/oss-upload-button";
import PreviewController from "@netless/preview-controller";
// import DocsCenter from "@netless/docs-center";
import OssDropUpload from "@netless/oss-drop-upload";

import { NETLESS, OSS_CONFIG } from "../constants/Process";

import { observer } from "mobx-react-lite";
import { WhiteboardStore } from "../stores/WhiteboardStore";

import pages from "../assets/image/pages.svg";
import "./Whiteboard.less";
import { i18n } from "../utils/i18n";
export interface WhiteboardProps {
    whiteboardStore: WhiteboardStore;
}

export const Whiteboard = observer<WhiteboardProps>(function Whiteboard({ whiteboardStore }) {
    const [whiteboardEl, setWhiteboardEl] = useState<HTMLDivElement>();

    const { room } = whiteboardStore;

    const bindWhiteboard = useCallback(
        (ref: HTMLDivElement) => {
            setWhiteboardEl(ref);
            if (room) {
                room.bindHtmlElement(ref);
                room.scalePptToFit();
            }
        },
        [room],
    );

    return (
        room && (
            <div
                className={classNames("whiteboard-container", {
                    "is-readonly": !whiteboardStore.isWritable,
                })}
            >
                <div className="zoom-controller-box">
                    <ZoomController room={room} />
                </div>
                <div className="whiteboard-writable-area">
                    <div className="tool-box-out">
                        <ToolBox
                            room={room}
                            customerComponent={[
                                <OssUploadButton
                                    i18nLanguage={i18n.language}
                                    oss={OSS_CONFIG}
                                    appIdentifier={NETLESS.APP_IDENTIFIER}
                                    sdkToken={NETLESS.SDK_TOKEN}
                                    room={room}
                                    whiteboardRef={whiteboardEl}
                                    enables={
                                        whiteboardStore.isCreator ? undefined : [UploadType.Image]
                                    }
                                />,
                            ]}
                        />
                    </div>
                    <div className="redo-undo-box">
                        <RedoUndo room={room} />
                    </div>
                    <div className="page-controller-box">
                        <div className="page-controller-mid-box">
                            <PageController room={room} />
                            <div
                                className="page-preview-cell"
                                onClick={whiteboardStore.showPreviewPanel}
                            >
                                <img src={pages} alt={"pages"} />
                            </div>
                        </div>
                    </div>
                    <PreviewController
                        handlePreviewState={whiteboardStore.setPreviewPanel}
                        isVisible={whiteboardStore.isShowPreviewPanel}
                        room={room}
                    />
                    {/*
                            <DocsCenter
                                handleDocCenterState={whiteboardStore.setFileOpen}
                                isFileOpen={whiteboardStore.isFileOpen}
                                room={room}
                            />
                        */}
                </div>
                <OssDropUpload room={room} oss={OSS_CONFIG}>
                    <div ref={bindWhiteboard} className="whiteboard-box" />
                </OssDropUpload>
            </div>
        )
    );
});
