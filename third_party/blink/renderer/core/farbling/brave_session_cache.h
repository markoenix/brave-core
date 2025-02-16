/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_THIRD_PARTY_BLINK_RENDERER_CORE_FARBLING_BRAVE_SESSION_CACHE_H_
#define BRAVE_THIRD_PARTY_BLINK_RENDERER_CORE_FARBLING_BRAVE_SESSION_CACHE_H_

#include <map>
#include <string>

#include "base/callback.h"
#include "brave/third_party/blink/renderer/brave_farbling_constants.h"
#include "third_party/abseil-cpp/absl/random/random.h"
#include "third_party/blink/renderer/core/core_export.h"
#include "third_party/blink/renderer/core/execution_context/execution_context.h"
#include "third_party/blink/renderer/core/frame/dom_window.h"
#include "third_party/blink/renderer/platform/wtf/text/atomic_string.h"

namespace blink {
class WebContentSettingsClient;
}  // namespace blink

namespace brave {

using blink::DOMWindow;
using blink::ExecutionContext;
using blink::GarbageCollected;
using blink::MakeGarbageCollected;
using blink::Supplement;

enum FarbleKey : uint64_t {
  kNone,
  kWindowInnerWidth,
  kWindowInnerHeight,
  kWindowScreenX,
  kWindowScreenY,
  kPointerScreenX,
  kPointerScreenY,
  kKeyCount
};

typedef absl::randen_engine<uint64_t> FarblingPRNG;
typedef base::RepeatingCallback<float(float, size_t)> AudioFarblingCallback;

CORE_EXPORT blink::WebContentSettingsClient* GetContentSettingsClientFor(
    ExecutionContext* context);
CORE_EXPORT BraveFarblingLevel
GetBraveFarblingLevelFor(ExecutionContext* context,
                         BraveFarblingLevel default_value);
CORE_EXPORT bool AllowFingerprinting(ExecutionContext* context);
CORE_EXPORT bool AllowFontFamily(ExecutionContext* context,
                                 const AtomicString& family_name);
CORE_EXPORT int FarbleInteger(ExecutionContext* context,
                              brave::FarbleKey key,
                              int spoof_value,
                              int min_value,
                              int max_value);
CORE_EXPORT bool BlockScreenFingerprinting(ExecutionContext* context);
CORE_EXPORT int FarbledPointerScreenCoordinate(const DOMWindow* view,
                                               FarbleKey key,
                                               int client_coordinate,
                                               int true_screen_coordinate);

class CORE_EXPORT BraveSessionCache final
    : public GarbageCollected<BraveSessionCache>,
      public Supplement<ExecutionContext> {
 public:
  static const char kSupplementName[];

  explicit BraveSessionCache(ExecutionContext&);
  virtual ~BraveSessionCache() = default;

  static BraveSessionCache& From(ExecutionContext&);
  static void Init();

  AudioFarblingCallback GetAudioFarblingCallback(
      blink::WebContentSettingsClient* settings);
  void PerturbPixels(blink::WebContentSettingsClient* settings,
                     const unsigned char* data,
                     size_t size);
  WTF::String GenerateRandomString(std::string seed, wtf_size_t length);
  WTF::String FarbledUserAgent(WTF::String real_user_agent);
  int FarbledInteger(FarbleKey key,
                     int spoof_value,
                     int min_random_offset,
                     int max_random_offset);
  bool AllowFontFamily(blink::WebContentSettingsClient* settings,
                       const AtomicString& family_name);
  FarblingPRNG MakePseudoRandomGenerator(FarbleKey key = FarbleKey::kNone);

 private:
  bool farbling_enabled_;
  uint64_t session_key_;
  uint8_t domain_key_[32];
  std::map<FarbleKey, int> farbled_integers_;

  void PerturbPixelsInternal(const unsigned char* data, size_t size);
};

}  // namespace brave

#endif  // BRAVE_THIRD_PARTY_BLINK_RENDERER_CORE_FARBLING_BRAVE_SESSION_CACHE_H_
