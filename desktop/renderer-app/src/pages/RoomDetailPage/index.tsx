import backSVG from "../../assets/image/back.svg";
import homeIconGraySVG from "../../assets/image/home-icon-gray.svg";
import roomTypeSVG from "../../assets/image/room-type.svg";
// import docsIconSVG from "../../assets/image/docs-icon.svg";
import "./RoomDetailPage.less";

import React, { useContext, useEffect } from "react";
import { format, formatDistanceStrict } from "date-fns";
import { Divider } from "antd";
import { observer } from "mobx-react-lite";
import { zhCN } from "date-fns/locale";
import { Link, useParams } from "react-router-dom";
import MainPageLayout from "../../components/MainPageLayout";
import { RoomStatus, RoomType } from "../../apiMiddleware/flatServer/constants";
import { generateRoutePath, RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext, RoomStoreContext } from "../../components/StoreProvider";
import LoadingPage from "../../LoadingPage";
import { useComputed } from "../../utils/mobx";
import { RoomStatusElement } from "../../components/RoomStatusElement/RoomStatusElement";
import { joinRoomHandler } from "../utils/joinRoomHandler";
import { errorTips } from "../../components/Tips/ErrorTips";
import { RoomDetailFooter } from "./RoomDetailFooter";

export type RoomDetailPageProps = {};

export const RoomDetailPage = observer<RoomDetailPageProps>(function RoomDetailPage() {
    const { roomUUID, periodicUUID } = useParams<RouteParams<RouteNameType.RoomDetailPage>>();
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const roomStore = useContext(RoomStoreContext);
    const roomInfo = roomStore.rooms.get(roomUUID);

    const formattedBeginTime = useComputed(() => formatTime(roomInfo?.beginTime), [roomInfo]).get();
    const formattedEndTime = useComputed(() => formatTime(roomInfo?.endTime), [roomInfo]).get();

    useEffect(() => {
        if (periodicUUID) {
            roomStore.syncPeriodicSubRoomInfo({ roomUUID, periodicUUID }).catch(errorTips);
        } else {
            roomStore.syncOrdinaryRoomInfo(roomUUID).catch(errorTips);
        }
    }, [roomStore, roomUUID, periodicUUID]);

    if (!roomInfo) {
        return <LoadingPage />;
    }

    const isCreator = roomInfo.ownerUUID === globalStore.userUUID;

    return (
        <MainPageLayout>
            <div className="user-room-detail-box">
                <div className="user-room-detail-nav">
                    <div className="user-room-detail-head">
                        <Link to={"/user/"}>
                            <div className="user-room-detail-back">
                                <img src={backSVG} alt="back" />
                                <span>??????</span>
                            </div>
                        </Link>
                        <div className="user-segmentation" />
                        {roomInfo.title && (
                            <>
                                <Divider type="vertical" />
                                <h1 className="user-room-detail-title">{roomInfo.title}</h1>
                            </>
                        )}
                        {periodicUUID && (
                            <>
                                <div className="user-periodic">??????</div>
                                {roomInfo.roomStatus !== RoomStatus.Stopped && (
                                    <div className="user-periodic-room">
                                        {roomInfo.count && (
                                            <Link
                                                to={generateRoutePath(
                                                    RouteNameType.ScheduleRoomDetailPage,
                                                    {
                                                        periodicUUID,
                                                    },
                                                )}
                                            >
                                                ???????????? {roomInfo.count} ?????????
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="user-room-detail-cut-line" />
                </div>
                <div className="user-room-detail-body">
                    <div className="user-room-detail-mid">
                        <div className="user-room-time">
                            {formattedBeginTime && (
                                <div className="user-room-time-box">
                                    <div className="user-room-time-number">
                                        {formattedBeginTime.time}
                                    </div>
                                    <div className="user-room-time-date">
                                        {formattedBeginTime.date}
                                    </div>
                                </div>
                            )}
                            {roomInfo.endTime && roomInfo.beginTime && (
                                <div className="user-room-time-mid">
                                    <div className="user-room-time-during">
                                        {formatDistanceStrict(
                                            roomInfo.endTime,
                                            roomInfo.beginTime,
                                            { locale: zhCN },
                                        )}
                                    </div>
                                    <div className="user-room-time-state">
                                        <RoomStatusElement room={roomInfo} />
                                    </div>
                                </div>
                            )}
                            {formattedEndTime && (
                                <div className="user-room-time-box">
                                    <div className="user-room-time-number">
                                        {formattedEndTime.time}
                                    </div>
                                    <div className="user-room-time-date">
                                        {formattedEndTime.date}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="user-room-cut-line" />
                        <div className="user-room-detail">
                            <div className="user-room-inf">
                                <div className="user-room-docs-title">
                                    <img
                                        width={22}
                                        height={22}
                                        src={homeIconGraySVG}
                                        alt={"home_icon_gray"}
                                    />
                                    <span>?????????</span>
                                </div>
                                <div
                                    className="user-room-docs-right"
                                    style={{ userSelect: "text" }}
                                >
                                    {periodicUUID || roomUUID}
                                </div>
                            </div>
                            <div className="user-room-inf">
                                <div className="user-room-docs-title">
                                    <img
                                        width={22}
                                        height={22}
                                        src={roomTypeSVG}
                                        alt={"room_type"}
                                    />
                                    <span>????????????</span>
                                </div>
                                <div className="user-room-docs-right">
                                    {roomTypeLocale(roomInfo.roomType)}
                                </div>
                            </div>
                            {/* <div className="user-room-docs">
                                <div className="user-room-docs-title">
                                    <img
                                        width={22}
                                        height={22}
                                        src={docsIconSVG}
                                        alt={"docs_icon"}
                                    />
                                    <span>??????.xxx (??????)</span>
                                </div>
                                <div className="user-room-docs-set">??????</div>
                            </div>
                            <div className="user-room-docs">
                                <div className="user-room-docs-title">
                                    <img
                                        width={22}
                                        height={22}
                                        src={docsIconSVG}
                                        alt={"docs_icon"}
                                    />
                                    <span>??????.xxx (??????)</span>
                                </div>
                                <div className="user-room-docs-set">??????</div>
                            </div> */}
                        </div>
                        <RoomDetailFooter
                            isCreator={isCreator}
                            room={roomInfo}
                            onJoinRoom={joinRoom}
                        />
                    </div>
                </div>
            </div>
        </MainPageLayout>
    );

    async function joinRoom(): Promise<void> {
        if (roomInfo) {
            await joinRoomHandler(roomInfo.roomUUID, pushHistory);
        }
    }
});

export default RoomDetailPage;

function formatTime(time?: number): { date: string; time: string } | null {
    return time
        ? {
              date: format(time, "yyyy/MM/dd", { locale: zhCN }),
              time: format(time, "HH:mm"),
          }
        : null;
}

function roomTypeLocale(roomType?: RoomType): string {
    switch (roomType) {
        case RoomType.OneToOne: {
            return "?????????";
        }
        case RoomType.SmallClass: {
            return "?????????";
        }
        default: {
            return "?????????";
        }
    }
}
