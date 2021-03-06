import joinSVG from "../../../assets/image/join.svg";

import React, { useContext, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Modal, Checkbox, Form } from "antd";
import { validate, version } from "uuid";
import { ConfigStoreContext, GlobalStoreContext } from "../../../components/StoreProvider";
import { useSafePromise } from "../../../utils/hooks/lifecycle";

interface JoinRoomFormValues {
    roomUUID: string;
    autoCameraOn: boolean;
    autoMicOn: boolean;
}

export interface JoinRoomBoxProps {
    onJoinRoom: (roomUUID: string) => Promise<void>;
}

export const JoinRoomBox = observer<JoinRoomBoxProps>(function JoinRoomBox({ onJoinRoom }) {
    const sp = useSafePromise();
    const globalStore = useContext(GlobalStoreContext);
    const configStore = useContext(ConfigStoreContext);
    const [form] = Form.useForm<JoinRoomFormValues>();

    const [isLoading, setLoading] = useState(false);
    const [isShowModal, showModal] = useState(false);
    const [isFormValidated, setIsFormValidated] = useState(false);
    const roomTitleInputRef = useRef<Input>(null);

    useEffect(() => {
        let ticket = NaN;
        if (isShowModal) {
            // wait a cycle till antd modal updated
            ticket = window.setTimeout(() => {
                if (roomTitleInputRef.current) {
                    roomTitleInputRef.current.focus();
                    roomTitleInputRef.current.select();
                }
            }, 0);
        }
        return () => {
            window.clearTimeout(ticket);
        };
    }, [isShowModal]);

    const defaultValues: JoinRoomFormValues = {
        roomUUID: "",
        autoCameraOn: configStore.autoCameraOn,
        autoMicOn: configStore.autoMicOn,
    };

    // const historyMenu = (
    //     <Menu className="modal-menu-item">
    //         {/* {// @TODO add join room history
    // joinRoomHistories.map(room => (
    //     <Menu.Item key={room.uuid}>{room.name || room.uuid}</Menu.Item>
    // ))} */}
    //         <Menu.Divider />
    //         <Button className="modal-inner-select" type="link">
    //             ????????????
    //         </Button>
    //     </Menu>
    // );

    return (
        <>
            <Button onClick={handleShowModal}>
                <img src={joinSVG} alt="join room" />
                <span className="label">????????????</span>
            </Button>
            <Modal
                title="????????????"
                width={368}
                visible={isShowModal}
                okText={"??????"}
                cancelText={"??????"}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        ??????
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={isLoading}
                        onClick={handleOk}
                        disabled={!isFormValidated}
                    >
                        ??????
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="createRoom"
                    className="main-room-menu-form"
                    initialValues={defaultValues}
                    onFieldsChange={formValidateStatus}
                >
                    <Form.Item
                        name="roomUUID"
                        label="?????????"
                        rules={[{ required: true, message: "??????????????????" }]}
                    >
                        <Input
                            placeholder="??????????????????"
                            ref={roomTitleInputRef}
                            // suffix={
                            //     <Dropdown
                            //         trigger={["click"]}
                            //         placement="bottomRight"
                            //         overlay={historyMenu}
                            //     >
                            //         <img
                            //             className="modal-dropdown-icon"
                            //             src={dropdownSVG}
                            //             alt={"dropdown"}
                            //         />
                            //     </Dropdown>
                            // }
                        />
                    </Form.Item>
                    <Form.Item label="??????">
                        <Input disabled value={globalStore.wechat?.name} />
                    </Form.Item>
                    <Form.Item label="????????????">
                        <Form.Item name="autoMicOn" noStyle valuePropName="checked">
                            <Checkbox>???????????????</Checkbox>
                        </Form.Item>
                        <Form.Item name="autoCameraOn" noStyle valuePropName="checked">
                            <Checkbox>???????????????</Checkbox>
                        </Form.Item>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );

    async function handleShowModal(): Promise<void> {
        try {
            const roomUUID = await navigator.clipboard.readText();
            if (validate(roomUUID) && version(roomUUID) === 4) {
                form.setFieldsValue({ roomUUID });
                setIsFormValidated(true);
            }
        } catch {
            // ignore
        }
        showModal(true);
    }

    async function handleOk(): Promise<void> {
        try {
            await sp(form.validateFields());
        } catch (e) {
            // errors are displayed on the form
            return;
        }

        setLoading(true);

        try {
            const values = form.getFieldsValue();
            configStore.updateAutoMicOn(values.autoMicOn);
            configStore.updateAutoCameraOn(values.autoCameraOn);
            await sp(onJoinRoom(values.roomUUID));
            setLoading(false);
            showModal(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    }

    function handleCancel(): void {
        showModal(false);
    }

    function formValidateStatus(): void {
        setIsFormValidated(form.getFieldsError().every(field => field.errors.length <= 0));
    }
});
