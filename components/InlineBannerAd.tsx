import React from "react";
import { View } from "react-native";
import { BannerAdSize } from "../utils/mobileAds";
import { adUnits } from "../utils/adUnits";
import { TrackedBannerAd } from "./TrackedBannerAd";

const bannerAdUnitId = adUnits.inlineBanner;

type InlineBannerAdProps = {
  className?: string;
};

const InlineBannerAd = ({ className = "my-4" }: InlineBannerAdProps) => (
  <View className={`items-center ${className}`}>
    <TrackedBannerAd unitId={bannerAdUnitId} size={BannerAdSize.BANNER} placement="inline" />
  </View>
);

export default InlineBannerAd;
