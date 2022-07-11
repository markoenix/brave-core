/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "bat/ads/internal/ads/notification_ad.h"

#include "base/time/time.h"
#include "bat/ads/ad_type.h"
#include "bat/ads/confirmation_type.h"
#include "bat/ads/internal/account/transactions/transactions_unittest_util.h"
#include "bat/ads/internal/ads/ad_events/ad_event_unittest_util.h"
#include "bat/ads/internal/ads/notification_ad_unittest_util.h"
#include "bat/ads/internal/ads/serving/permission_rules/permission_rules_unittest_util.h"
#include "bat/ads/internal/base/net/http/http_status_code.h"
#include "bat/ads/internal/base/unittest/unittest_base.h"
#include "bat/ads/internal/base/unittest/unittest_mock_util.h"
#include "bat/ads/internal/creatives/notification_ads/creative_notification_ad_unittest_util.h"
#include "bat/ads/internal/history/history_unittest_util.h"
#include "bat/ads/notification_ad_info.h"
#include "bat/ads/public/interfaces/ads.mojom.h"

// npm run test -- brave_unit_tests --filter=BatAds*

using ::testing::_;

namespace ads {

class BatAdsNotificationAdForMobileIntegrationTest : public UnitTestBase {
 protected:
  BatAdsNotificationAdForMobileIntegrationTest() = default;

  ~BatAdsNotificationAdForMobileIntegrationTest() override = default;

  void SetUp() override {
    UnitTestBase::SetUpForTesting(/* is_integration_test */ true);

    ForcePermissionRules();
  }

  void SetUpMocks() override {
    MockPlatformHelper(platform_helper_mock_, PlatformType::kAndroid);

    const URLEndpointMap endpoints = {
        {"/v9/catalog",
         {{net::HTTP_OK, "/catalog_with_notification_ad.json"}}}};
    MockUrlRequest(ads_client_mock_, endpoints);
  }

  void ServeNextAd() {
    ASSERT_TRUE(IsServingAdAtRegularIntervals());
    const base::Time serve_ad_at =
        ClientStateManager::GetInstance()->GetServeAdAt();
    FastForwardClockTo(serve_ad_at);
  }

  void ServeAd() {
    GetAds()->OnUnIdle(base::TimeDelta::Min(), /* was_locked */ false);
  }
};

TEST_F(BatAdsNotificationAdForMobileIntegrationTest, ServeAtRegularIntervals) {
  // Arrange
  EXPECT_CALL(*ads_client_mock_, ShowNotification)
      .WillOnce(testing::Invoke([=](const NotificationAdInfo& ad) {
        ASSERT_TRUE(
            NotificationAdManager::GetInstance()->Exists(ad.placement_id));
      }));

  // Act
  ServeNextAd();

  // Assert
  EXPECT_EQ(
      1, GetAdEventCount(AdType::kNotificationAd, ConfirmationType::kServed));
  EXPECT_EQ(0, GetHistoryItemCount());
  EXPECT_EQ(0, GetTransactionCount());
}

TEST_F(BatAdsNotificationAdForMobileIntegrationTest,
       DoNotServeWhenUserBecomesActive) {
  // Arrange
  EXPECT_CALL(*ads_client_mock_, ShowNotification(_)).Times(0);

  // Act
  ServeAd();

  // Assert
  EXPECT_EQ(
      0, GetAdEventCount(AdType::kNotificationAd, ConfirmationType::kServed));
}

TEST_F(BatAdsNotificationAdForMobileIntegrationTest, TriggerServedEvent) {
  // Arrange
  EXPECT_CALL(*ads_client_mock_, ShowNotification)
      .WillOnce(testing::Invoke([=](const NotificationAdInfo& ad) {
        ASSERT_TRUE(
            NotificationAdManager::GetInstance()->Exists(ad.placement_id));

        // Act
        GetAds()->TriggerNotificationAdEvent(
            ad.placement_id, mojom::NotificationAdEventType::kServed);

        // Assert
        ASSERT_TRUE(
            NotificationAdManager::GetInstance()->Exists(ad.placement_id));
        EXPECT_EQ(1, GetAdEventCount(AdType::kNotificationAd,
                                     ConfirmationType::kServed));
        EXPECT_EQ(0, GetHistoryItemCount());
        EXPECT_EQ(0, GetTransactionCount());
      }));

  ServeNextAd();
}

TEST_F(BatAdsNotificationAdForMobileIntegrationTest, TriggerViewedEvent) {
  // Arrange
  EXPECT_CALL(*ads_client_mock_, ShowNotification)
      .WillOnce(testing::Invoke([=](const NotificationAdInfo& ad) {
        ASSERT_TRUE(
            NotificationAdManager::GetInstance()->Exists(ad.placement_id));

        // Act
        GetAds()->TriggerNotificationAdEvent(
            ad.placement_id, mojom::NotificationAdEventType::kViewed);

        // Assert
        ASSERT_TRUE(
            NotificationAdManager::GetInstance()->Exists(ad.placement_id));
        EXPECT_EQ(1, GetAdEventCount(AdType::kNotificationAd,
                                     ConfirmationType::kViewed));
        EXPECT_EQ(1, GetHistoryItemCount());
        EXPECT_EQ(1, GetTransactionCount());
      }));

  ServeNextAd();
}

TEST_F(BatAdsNotificationAdForMobileIntegrationTest, TriggerClickedEvent) {
  // Arrange
  EXPECT_CALL(*ads_client_mock_, ShowNotification)
      .WillOnce(testing::Invoke([=](const NotificationAdInfo& ad) {
        ASSERT_TRUE(
            NotificationAdManager::GetInstance()->Exists(ad.placement_id));
        EXPECT_CALL(*ads_client_mock_, CloseNotification(ad.placement_id))
            .Times(1);

        // Act
        GetAds()->TriggerNotificationAdEvent(
            ad.placement_id, mojom::NotificationAdEventType::kClicked);

        // Assert
        EXPECT_EQ(1, GetAdEventCount(AdType::kNotificationAd,
                                     ConfirmationType::kClicked));
        EXPECT_EQ(1, GetHistoryItemCount());
        EXPECT_EQ(1, GetTransactionCount());
      }));

  ServeNextAd();
}

TEST_F(BatAdsNotificationAdForMobileIntegrationTest, TriggerDismissedEvent) {
  // Arrange
  EXPECT_CALL(*ads_client_mock_, ShowNotification)
      .WillOnce(testing::Invoke([=](const NotificationAdInfo& ad) {
        ASSERT_TRUE(
            NotificationAdManager::GetInstance()->Exists(ad.placement_id));

        // Act
        GetAds()->TriggerNotificationAdEvent(
            ad.placement_id, mojom::NotificationAdEventType::kDismissed);

        // Assert
        EXPECT_FALSE(
            NotificationAdManager::GetInstance()->Exists(ad.placement_id));
        EXPECT_EQ(1, GetAdEventCount(AdType::kNotificationAd,
                                     ConfirmationType::kDismissed));
        EXPECT_EQ(1, GetHistoryItemCount());
        EXPECT_EQ(1, GetTransactionCount());
      }));

  ServeNextAd();
}

TEST_F(BatAdsNotificationAdForMobileIntegrationTest, TriggerTimedOutEvent) {
  // Arrange
  EXPECT_CALL(*ads_client_mock_, ShowNotification)
      .WillOnce(testing::Invoke([=](const NotificationAdInfo& ad) {
        ASSERT_TRUE(
            NotificationAdManager::GetInstance()->Exists(ad.placement_id));

        // Act
        GetAds()->TriggerNotificationAdEvent(
            ad.placement_id, mojom::NotificationAdEventType::kTimedOut);

        // Assert
        EXPECT_FALSE(
            NotificationAdManager::GetInstance()->Exists(ad.placement_id));
        EXPECT_EQ(0, GetHistoryItemCount());
        EXPECT_EQ(0, GetTransactionCount());
      }));

  ServeNextAd();
}

}  // namespace ads