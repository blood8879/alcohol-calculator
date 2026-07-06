import React from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize } from "../utils/mobileAds";
import { adUnits } from "../utils/adUnits";

const bannerAdUnitId = adUnits.inlineBanner;

type InlineBannerAdProps = {
  className?: string;
};

const InlineBannerAd = ({ className = "my-4" }: InlineBannerAdProps) => (
  <View className={`items-center ${className}`}>
    <BannerAd unitId={bannerAdUnitId} size={BannerAdSize.BANNER} />
  </View>
);

export default InlineBannerAd;
