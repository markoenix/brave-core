/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_VENDOR_BAT_NATIVE_LEDGER_SRC_BAT_LEDGER_INTERNAL_UPHOLD_UPHOLD_USER_H_
#define BRAVE_VENDOR_BAT_NATIVE_LEDGER_SRC_BAT_LEDGER_INTERNAL_UPHOLD_UPHOLD_USER_H_

#include <memory>
#include <string>

#include "bat/ledger/ledger.h"

namespace ledger {
class LedgerImpl;

namespace endpoint {
class UpholdServer;
}

namespace uphold {

struct User {
  std::string name;
  std::string member_id;
  bool bat_not_allowed;

  User();
  ~User();
};

using GetUserCallback = base::OnceCallback<void(mojom::Result, const User&)>;

class UpholdUser {
 public:
  explicit UpholdUser(LedgerImpl* ledger);

  ~UpholdUser();

  void Get(GetUserCallback callback);

 private:
  void OnGet(GetUserCallback callback, mojom::Result result, const User& user);

  LedgerImpl* ledger_;  // NOT OWNED
  std::unique_ptr<endpoint::UpholdServer> uphold_server_;
};

}  // namespace uphold
}  // namespace ledger
#endif  // BRAVE_VENDOR_BAT_NATIVE_LEDGER_SRC_BAT_LEDGER_INTERNAL_UPHOLD_UPHOLD_USER_H_
