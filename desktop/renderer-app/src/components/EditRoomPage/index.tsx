import "./EditRoomPage.less";
import back from "../../assets/image/back.svg";

import React, { useMemo, useRef, useState } from "react";
import { Button, Checkbox, Input, Form, Divider, Modal } from "antd";
import { observer } from "mobx-react-lite";
import { Link, useHistory } from "react-router-dom";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { getDay, addWeeks, endOfDay } from "date-fns";
import { generateRoutePath, RouteNameType } from "../../utils/routes";
import MainPageLayout from "../../components/MainPageLayout";
import { RoomTypeSelect } from "../../components/RoomType";
import { EditRoomFormValues } from "./typings";
import { renderBeginTimePicker } from "./renderBeginTimePicker";
import { renderEndTimePicker } from "./renderEndTimePicker";
import { renderPeriodicForm } from "./renderPeriodicForm";
import { PeriodicEndType } from "../../constants/Periodic";

export type { EditRoomFormValues } from "./typings";

export type EditRoomFormInitialValues =
    | ({ isPeriodic: true } & Omit<EditRoomFormValues, "isPeriodic">)
    | ({ isPeriodic: false } & Omit<EditRoomFormValues, "periodic" | "isPeriodic"> &
          Pick<Partial<EditRoomFormValues>, "periodic">);

export enum EditRoomType {
    Schedule,
    EditOrdinary,
    EditPeriodic,
    EditPeriodicSub,
}

export interface EditRoomPageProps {
    type: EditRoomType;
    initialValues: EditRoomFormInitialValues;
    loading: boolean;
    onSubmit: (value: EditRoomFormValues) => void;
    previousPeriodicRoomBeginTime?: number | null;
    nextPeriodicRoomEndTime?: number | null;
}

export const EditRoomPage = observer<EditRoomPageProps>(function EditRoomPage({
    type,
    initialValues,
    loading,
    onSubmit,
    previousPeriodicRoomBeginTime,
    nextPeriodicRoomEndTime,
}) {
    const history = useHistory();

    const [isFormVetted, setIsFormVetted] = useState(true);
    const [isShowEditSubmitConfirm, showEditSubmitConfirm] = useState(false);

    const hasInputAutoSelectedRef = useRef(false);

    const [form] = Form.useForm<EditRoomFormValues>();

    const defaultValues = useMemo<EditRoomFormValues>(() => {
        return {
            periodic: {
                endType: PeriodicEndType.Rate,
                weeks: [getDay(initialValues.beginTime)],
                rate: 7,
                endTime: addWeeks(initialValues.beginTime, 6),
            },
            ...initialValues,
        };
    }, [initialValues]);

    return (
        <MainPageLayout>
            <div className="edit-room-box">
                <div className="edit-room-nav">
                    <div className="edit-room-head">
                        <Link
                            to={generateRoutePath(RouteNameType.HomePage, {})}
                            onClick={e => {
                                e.preventDefault();
                                onCancelForm();
                            }}
                            className="edit-room-back"
                        >
                            <img src={back} alt="back" />
                            <span>??????</span>
                        </Link>
                        <Divider type="vertical" />
                        <h1 className="edit-room-title">
                            {type === EditRoomType.Schedule ? "????????????" : "????????????"}
                        </h1>
                    </div>
                </div>
                <div className="edit-room-body">
                    <div className="edit-room-mid">
                        <Form
                            form={form}
                            layout="vertical"
                            name="createRoom"
                            initialValues={defaultValues}
                            className="edit-room-form"
                            onFieldsChange={formValidateStatus}
                        >
                            <Form.Item
                                label="??????"
                                name="title"
                                required={false}
                                rules={[
                                    { required: true, message: "???????????????" },
                                    { max: 50, message: "??????????????? 50 ?????????" },
                                ]}
                            >
                                <Input
                                    placeholder="?????????????????????"
                                    disabled={type === EditRoomType.EditPeriodicSub}
                                    ref={input => {
                                        if (!input) {
                                            return;
                                        }
                                        // select text on next cycle so that
                                        // dom is always ready
                                        setTimeout(() => {
                                            if (hasInputAutoSelectedRef.current) {
                                                return;
                                            }
                                            if (input) {
                                                input.focus();
                                                input.select();
                                                hasInputAutoSelectedRef.current = true;
                                            }
                                        }, 0);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item label="??????" name="type">
                                <RoomTypeSelect disabled={type === EditRoomType.EditPeriodicSub} />
                            </Form.Item>
                            {renderBeginTimePicker(
                                form,
                                previousPeriodicRoomBeginTime,
                                nextPeriodicRoomEndTime,
                            )}
                            {renderEndTimePicker(form, nextPeriodicRoomEndTime)}
                            {type === EditRoomType.Schedule ? (
                                <Form.Item name="isPeriodic" valuePropName="checked">
                                    <Checkbox onChange={onToggleIsPeriodic}>
                                        <span className="edit-room-cycle">???????????????</span>
                                    </Checkbox>
                                </Form.Item>
                            ) : (
                                type === EditRoomType.EditPeriodic && (
                                    <div className="ant-form-item-label edit-room-form-label">
                                        ???????????????
                                    </div>
                                )
                            )}
                            <Form.Item
                                noStyle
                                shouldUpdate={(
                                    prev: EditRoomFormValues,
                                    curr: EditRoomFormValues,
                                ) => prev.isPeriodic !== curr.isPeriodic}
                            >
                                {renderPeriodicForm}
                            </Form.Item>
                        </Form>
                        <div className="edit-room-under">
                            <Button className="edit-room-cancel" onClick={onCancelForm}>
                                ??????
                            </Button>
                            <Button
                                className="edit-room-ok"
                                onClick={async () => {
                                    if (!form.isFieldsTouched() && type !== EditRoomType.Schedule) {
                                        history.goBack();
                                    } else {
                                        await form.validateFields();
                                        if (!loading && isFormVetted) {
                                            if (type === EditRoomType.Schedule) {
                                                onSubmitForm();
                                            } else {
                                                showEditSubmitConfirm(true);
                                            }
                                        }
                                    }
                                }}
                                loading={loading}
                                disabled={!loading && !isFormVetted}
                            >
                                {type === EditRoomType.Schedule ? "??????" : "??????"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            {type !== EditRoomType.Schedule && (
                <Modal
                    visible={isShowEditSubmitConfirm}
                    title={renderModalTitle(type)}
                    onCancel={hideEditSubmitConfirm}
                    onOk={onSubmitForm}
                    footer={[
                        <Button key="Cancel" onClick={hideEditSubmitConfirm}>
                            ??????
                        </Button>,
                        <Button
                            key="Ok"
                            type="primary"
                            loading={loading}
                            disabled={!loading && !isFormVetted}
                            onClick={onSubmitForm}
                        >
                            ??????
                        </Button>,
                    ]}
                >
                    {renderModalContent(type)}
                </Modal>
            )}
        </MainPageLayout>
    );

    function renderModalTitle(editRoomType: EditRoomType): string {
        switch (editRoomType) {
            case EditRoomType.EditOrdinary:
                return "????????????";
            case EditRoomType.EditPeriodicSub:
                return "??????????????????";
            case EditRoomType.EditPeriodic:
                return "?????????????????????";
            default:
                return "????????????";
        }
    }

    function renderModalContent(editRoomType: EditRoomType): string {
        switch (editRoomType) {
            case EditRoomType.EditOrdinary:
                return "????????????????????????";
            case EditRoomType.EditPeriodicSub:
                return "???????????????????????????";
            case EditRoomType.EditPeriodic:
                return "???????????????????????????????????????";
            default:
                return "?????????????????????";
        }
    }

    function onToggleIsPeriodic(e: CheckboxChangeEvent): void {
        if (e.target.checked) {
            const today: EditRoomFormValues["beginTime"] = form.getFieldValue("beginTime");
            form.setFieldsValue({
                periodic: {
                    weeks: [getDay(today)],
                    rate: 7,
                    endTime: endOfDay(addWeeks(today, 6)),
                },
            });
        }
    }

    function onSubmitForm(): void {
        if (!loading && isFormVetted) {
            onSubmit(form.getFieldsValue(true));
        }
    }

    function onCancelForm(): void {
        if (form.isFieldsTouched()) {
            Modal.confirm({
                content: "???????????????????????????????????????",
                onOk() {
                    history.goBack();
                },
            });
        } else {
            history.goBack();
        }
    }

    function hideEditSubmitConfirm(): void {
        showEditSubmitConfirm(false);
    }

    function formValidateStatus(): void {
        setIsFormVetted(form.getFieldsError().every(field => field.errors.length <= 0));
    }
});

export default EditRoomPage;
