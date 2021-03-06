import React, { useCallback, useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { observer } from "mobx-react-lite";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";
import { RouteNameType, usePushHistory } from "../utils/routes";
import { useSafePromise } from "../utils/hooks/lifecycle";
import { ipcAsyncByMainWindow, ipcReceive, ipcReceiveRemove } from "../utils/ipc";
import { errorTips } from "./Tips/ErrorTips";

export enum ExitRoomConfirmType {
    StopClassButton,
    ExitButton,
}

export interface ExitRoomConfirmProps {
    isCreator: boolean;
    roomStatus: RoomStatus;
    hangClass: () => Promise<void>;
    stopClass: () => Promise<void>;
    // @TODO remove ref
    confirmRef: { current: (confirmType: ExitRoomConfirmType) => void };
}

export const ExitRoomConfirm = observer<ExitRoomConfirmProps>(function ExitRoomConfirm({
    isCreator,
    roomStatus,
    hangClass,
    stopClass,
    confirmRef,
}) {
    const [confirmType, setConfirmType] = useState(ExitRoomConfirmType.ExitButton);
    const [visible, setVisible] = useState(false);
    const [isReturnLoading, setReturnLoading] = useState(false);
    const [isStopLoading, setStopLoading] = useState(false);
    const sp = useSafePromise();
    const pushHistory = usePushHistory();

    const onReturnMain = useCallback(async () => {
        setReturnLoading(true);

        ipcAsyncByMainWindow("disable-window", {
            disable: false,
        });

        ipcAsyncByMainWindow("set-resizable", {
            resizable: false,
            minWidth: 1200,
            minHeight: 668,
        });

        ipcAsyncByMainWindow("set-maximizable", {
            maximizable: false,
        });

        try {
            await sp(hangClass());
        } catch (e) {
            setReturnLoading(false);
            console.error(e);
            errorTips(e);
        }

        pushHistory(RouteNameType.HomePage);
    }, [pushHistory, hangClass, sp]);

    const onStopClass = useCallback(async () => {
        setStopLoading(true);

        try {
            await sp(stopClass());
        } catch (e) {
            setStopLoading(false);
            console.error(e);
            errorTips(e);
        }
    }, [stopClass, sp]);

    const onCancel = useCallback(() => {
        setVisible(false);
    }, []);

    const confirm = useCallback(
        (confirmType: ExitRoomConfirmType) => {
            if (roomStatus === RoomStatus.Started || roomStatus === RoomStatus.Paused) {
                setVisible(true);
                setConfirmType(confirmType);
            } else {
                onReturnMain();
            }
        },
        [onReturnMain, roomStatus],
    );

    useEffect(() => {
        ipcAsyncByMainWindow("disable-window", {
            disable: true,
        });
        ipcReceive("window-will-close", () => {
            confirm(ExitRoomConfirmType.ExitButton);
        });

        ipcAsyncByMainWindow("set-resizable", {
            resizable: true,
            minWidth: 1200,
            minHeight: 700,
        });

        ipcAsyncByMainWindow("set-maximizable", {
            maximizable: true,
        });

        return () => {
            ipcAsyncByMainWindow("disable-window", {
                disable: false,
            });

            ipcReceiveRemove("window-will-close");

            ipcAsyncByMainWindow("set-resizable", {
                resizable: false,
                minWidth: 1200,
                minHeight: 668,
            });

            ipcAsyncByMainWindow("set-maximizable", {
                maximizable: false,
            });
        };
    }, [confirm]);

    confirmRef.current = confirm;

    return isCreator ? (
        confirmType === ExitRoomConfirmType.ExitButton ? (
            <Modal
                visible={visible}
                title="????????????"
                onOk={onCancel}
                onCancel={onCancel}
                footer={[
                    <Button key="Cancel" onClick={onCancel}>
                        ??????
                    </Button>,
                    <Button key="ReturnMain" loading={isReturnLoading} onClick={onReturnMain}>
                        ????????????
                    </Button>,
                    <Button
                        key="StopClass"
                        type="primary"
                        loading={isStopLoading}
                        onClick={onStopClass}
                    >
                        ????????????
                    </Button>,
                ]}
            >
                <p>????????????????????????????????????????????????????????????????????????</p>
            </Modal>
        ) : (
            <Modal
                visible={visible}
                title="??????????????????"
                okButtonProps={{ loading: isStopLoading }}
                onOk={onStopClass}
                onCancel={onCancel}
            >
                <p>
                    ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                </p>
            </Modal>
        )
    ) : (
        <Modal visible={visible} title="??????????????????" onOk={onReturnMain} onCancel={onCancel}>
            <p>??????????????????????????????????????????</p>
        </Modal>
    );
});

export default ExitRoomConfirm;
