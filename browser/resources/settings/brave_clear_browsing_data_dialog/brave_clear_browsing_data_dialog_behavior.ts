// @ts-nocheck
/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * you can obtain one at http://mozilla.org/MPL/2.0/. */


import "./brave_clear_browsing_data_on_exit_page.js"

import {loadTimeData} from "../i18n_setup.js"
import {WebUIListenerMixin} from 'chrome://resources/js/web_ui_listener_mixin.js';
import {SettingsClearBrowsingDataDialogElement} from '../clear_browsing_data_dialog/clear_browsing_data_dialog.js'
import type {SettingsClearBrowsingDataDialogElement as BraveSettingsClearBrowsingDataDialogElement} from '../clear_browsing_data_dialog/clear_browsing_data_dialog.js'

const BaseElement = WebUIListenerMixin(SettingsClearBrowsingDataDialogElement)
export class BraveSettingsClearBrowsingDataDialogElement extends BaseElement {
  ready() {
    super.ready()
    this.addOnExitElements_();
    this.addWebUIListener(
      'update-counter-text', this.updateOnExitCountersText.bind(this));
  }

  attached() {
    super.attached()
    this.listen(this.$.tabs, 'selected-item-changed',
      'onSelectedTabChanged_');
    this.listen(this.$$('#on-exit-tab'), 'clear-data-on-exit-page-change',
      'updateSaveButtonState_');
    this.listen(this.$$('#saveOnExitSettingsConfirm'), 'click',
      'saveOnExitSettings_');
  }

  detached() {
    super.detached()
    this.unlisten(this.$.tabs, 'selected-item-changed',
      'onSelectedTabChanged_');
    this.unlisten(this.$$('#on-exit-tab'), 'clear-data-on-exit-page-change',
      'updateSaveButtonState_');
    this.unlisten(this.$$('#saveOnExitSettingsConfirm'), 'click',
      'saveOnExitSettings_');
  }

  /**
   * Adds OnExit tab and Save button to the DOM.
   * @private
   */
  addOnExitElements_() {
    // Append On exit tab to tab selector.
    this.tabsNames_.push(loadTimeData.getString('onExitPageTitle'));
    // Append On exit tab page.
    let onExitPage = document.createElement(
        'settings-brave-clear-browsing-data-on-exit-page');
    onExitPage.id = 'on-exit-tab';
    onExitPage.prefs = this.prefs;
    this.$.tabs.appendChild(onExitPage);
    // Append Save button.
    let saveButton = document.createElement('cr-button');
    saveButton.id = 'saveOnExitSettingsConfirm';
    saveButton.disabled = true;
    saveButton.hidden = true;
    saveButton.className = 'action-button';
    saveButton.innerText = this.i18n('save');
    this.$.clearBrowsingDataConfirm.parentNode.appendChild(
        saveButton);
  }

/**
  * Updates the text of a browsing data counter corresponding to the given
  * preference.
  * @param {string} prefName Browsing data type deletion preference.
  * @param {string} text The text with which to update the counter
  * @private
  */
  updateOnExitCountersText(prefName, text) {
    // Data type deletion preferences are named "browser.clear_data.<datatype>".
    // Strip the common prefix, i.e. use only "<datatype>".
    const matches = prefName.match(/^browser\.clear_data\.(\w+)$/);
    this.$$('#on-exit-tab').setCounter(matches[1], text);
  }

  /**
   * Updates Clear and Save buttons visibility based on the selected tab.
   * @private
   */
  onSelectedTabChanged_() {
    const tab = this.$.tabs.selectedItem;
    if (!tab) {
      return;
    }
    const isOnExitTab = (this.$.tabs.selectedItem.id == 'on-exit-tab');
    this.$.clearBrowsingDataConfirm.hidden = isOnExitTab;
    this.$$('#saveOnExitSettingsConfirm').hidden = !isOnExitTab;
  }

  /**
   * Updates Save button enabled state based on on-exit-tab's changed state.
   * @private
   */
  updateSaveButtonState_() {
    this.$$('#saveOnExitSettingsConfirm').disabled =
        !this.$$('#on-exit-tab').isModified;
  }

  /**
   * Saves on exit settings selections.
   * @private
   */
  saveOnExitSettings_() {
    const changed = this.$$('#on-exit-tab').getChangedSettings();
    changed.forEach((change) => {
      this.set('prefs.' + change.key + '.value', change.value);
    });
    this.updateSaveButtonState_();
    if (!this.clearingInProgress_) {
      this.$.clearBrowsingDataDialog.close();
    }
  }
}
