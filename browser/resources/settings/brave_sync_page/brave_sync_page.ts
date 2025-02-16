/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

// @ts-nocheck TODO(petemill): Define types and remove ts-nocheck

/**
 * 'settings-brave-sync-page' is the settings page containing brave's
 * custom sync.
 */
import 'chrome://resources/cr_elements/cr_dialog/cr_dialog.js';
import 'chrome://resources/cr_elements/icons.html.js';
import '../settings_page/settings_animated_pages.js';
import '../settings_page/settings_subpage.js';
import '../settings_shared.css.js';
import '../settings_vars.css.js';
import './brave_sync_subpage.js';

import {I18nBehavior} from 'chrome://resources/cr_elements/i18n_behavior.js';
import {WebUIListenerBehavior} from 'chrome://resources/cr_elements/web_ui_listener_behavior.js';
import {Polymer} from 'chrome://resources/polymer/v3_0/polymer/polymer_bundled.min.js';

import {Router} from '../router.js';
import {SyncBrowserProxyImpl} from '../people_page/sync_browser_proxy.js';
import {BraveSyncBrowserProxy} from './brave_sync_browser_proxy.js';
import {getTemplate} from './brave_sync_page.html.js'

Polymer({
  is: 'settings-brave-sync-page',

  _template: getTemplate(),

  behaviors: [
    I18nBehavior,
    WebUIListenerBehavior,
  ],

  properties: {
    /**
     * The current sync status, supplied by SyncBrowserProxy.
     * @type {?SyncStatus}
     */
    syncStatus_: Object,
    isEncryptionSet_: {
      type: Boolean,
      value: false
    },
    syncLabel_: {
      type: String,
      computed: 'computeSyncLabel_(syncStatus_.firstSetupInProgress)'
    },
  },

  /** @private {?SyncBrowserProxy} */
  browserProxy_: null,
  /** @private */
  braveBrowserProxy_: null,

  /** @override */
  created: function() {
    this.browserProxy_ = SyncBrowserProxyImpl.getInstance();
    this.braveBrowserProxy_ = BraveSyncBrowserProxy.getInstance();
  },

  /** @private */
  computeSyncLabel_() {
    const isAlreadySetup = this.syncStatus_ !== undefined &&
        !this.syncStatus_.firstSetupInProgress;
    const key = isAlreadySetup ? 'braveSyncManageActionLabel' : 'braveSyncSetupActionLabel';
    return I18nBehavior.i18n(key);
  },

  /** @override */
  attached: function() {
    const onSyncStatus = this.handleSyncStatus_.bind(this)
    this.browserProxy_.getSyncStatus().then(onSyncStatus);
    this.addWebUIListener(
      'sync-prefs-changed', this.handleSyncPrefsChanged_.bind(this));
    this.addWebUIListener('sync-status-changed', onSyncStatus);
  },

  /** @private */
  onSyncTap_: function() {
    // Users can go to sync subpage regardless of sync status.
    const router = Router.getInstance();
    router.navigateTo(router.getRoutes().BRAVE_SYNC_SETUP);
  },

  /**
   * Handler for when the sync state is pushed from the browser.
   * @param {?SyncStatus} syncStatus
   * @private
   */
  handleSyncStatus_: async function(syncStatus) {
    this.syncStatus_ = syncStatus;
  },

  /**
   * Handler for when the sync preferences are updated.
   * @private
   */
  handleSyncPrefsChanged_: async function(syncPrefs) {
    if (this.syncStatus_ && !this.syncStatus_.firstSetupInProgress) {
      const pureSyncCode = await this.braveBrowserProxy_.getPureSyncCode()
      if (syncPrefs.passphraseRequired) {
        await this.browserProxy_.setDecryptionPassphrase(pureSyncCode);
      } else if (!this.isEncryptionSet_) {
        this.browserProxy_.setEncryptionPassphrase(pureSyncCode)
        .then(successfullySet => {
          this.isEncryptionSet_ = successfullySet
        })
      }
    }
  },
});
