import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { BannerAd } from "../utils/mobileAds";
import { logAdEvent, logAdFailure } from "../utils/adAnalytics";
import { useConsentState } from "../hooks/useConsentState";
import { getConsentSnapshot } from "../utils/consentState";

type Props = {
  readonly unitId: string;
  readonly size: string;
  readonly placement: "anchored" | "inline";
};

// 광고 미로드 자리(명세서 §2.6). 네이티브 배너 뷰는 로드 전 0×0이라 그 자리엔 컨테이너 뒤가 비쳐 보였다
// (앵커드 배너 컨테이너는 배경이 없어 루트 창의 흰 배경이 띠처럼 노출됨). 다크 배경으로 칠하고,
// AdMob 배너의 최소 높이(표준 320×50, 적응형도 50 이상)만큼 미리 잡아 로드 순간 레이아웃이 덜 튀게 한다.
// 로드 실패 시에는 빈 띠를 남기지 않도록 접는다(다음 자동 갱신에서 로드되면 다시 펼침).
export const BANNER_SLOT_MIN_HEIGHT = 50;

export function TrackedBannerAd({ unitId, size, placement }: Props) {
  const { canRequestAds } = useConsentState();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (canRequestAds) logAdEvent("ad_request", "banner", placement);
  }, [unitId, size, placement, canRequestAds]);

  if (!canRequestAds) return null;

  return (
    <View
      className="self-stretch bg-background items-center justify-center"
      style={{ minHeight: failed ? 0 : BANNER_SLOT_MIN_HEIGHT }}
    >
      <BannerAd
        unitId={unitId}
        size={size}
        onAdLoaded={() => {
          setFailed(false);
          if (getConsentSnapshot().canRequestAds) logAdEvent("ad_loaded", "banner", placement);
        }}
        onAdFailedToLoad={(error) => {
          setFailed(true);
          if (getConsentSnapshot().canRequestAds) logAdFailure("banner", placement, error, "load");
        }}
        onAdOpened={() => {
          if (getConsentSnapshot().canRequestAds) logAdEvent("ad_clicked", "banner", placement);
        }}
        onAdClosed={() => {
          if (getConsentSnapshot().canRequestAds) logAdEvent("ad_dismissed", "banner", placement);
        }}
      />
    </View>
  );
}
