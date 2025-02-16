/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

// Feature-specific components
import { Page, Panel, SlideContent } from '../components'

// Component groups
import WelcomeBox from './screens/welcomeBox'
import ImportBox from './screens/importBox'
import RewardsBox from './screens/rewardsBox'
import SearchBox from './screens/searchBox'
import ShieldsBox from './screens/shieldsBox'
import FooterBox from './screens/footerBox'

// Images
import { Background, BackgroundContainer } from '../components/images'

// Utils
import * as welcomeActions from '../actions/welcome_actions'

// Assets
import 'emptykit.css'

interface Props {
  welcomeData: Welcome.State
  actions: any
}

export interface State {
  currentScreen: number
  finished: boolean
  skipped: boolean
  shouldUpdateElementOverflow: boolean
}

export class WelcomePage extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      currentScreen: 1,
      finished: false,
      skipped: false,
      shouldUpdateElementOverflow: false
    }
  }

  componentDidUpdate (prevProps: Props) {
    this.props.actions.recordP3A(this.state)
  }

  get currentScreen () {
    return this.state.currentScreen
  }

  onClickLetsGo = () => {
    this.setState({
      currentScreen: this.state.currentScreen + 1
    })
  }

  onClickImport = (sourceBrowserProfileIndex: number) => {
    this.props.actions.importBrowserProfileRequested(sourceBrowserProfileIndex)
    this.setState({
      currentScreen: this.state.currentScreen + 1
    })
  }

  onClickRewardsGetStarted = () => {
    this.props.actions.goToTabRequested('chrome://rewards/enable', '_blank')
  }

  onClickSlideBullet = (nextScreen: number) => {
    this.setState({
      currentScreen: nextScreen
    })
  }

  onClickNext = () => {
    this.setState({
      currentScreen: this.state.currentScreen + 1
    })
  }

  onClickDone = () => {
    this.setState({
      finished: true
    })
    this.props.actions.goToTabRequested('chrome://newtab', '_self')
  }

  onClickSkip = () => {
    this.setState({
      skipped: true
    })
    this.props.actions.goToTabRequested('chrome://newtab', '_self')
  }

  resetStyleOverflow = () => {
    this.setState({ shouldUpdateElementOverflow: true })
  }

  render () {
    const { welcomeData, actions } = this.props
    const { shouldUpdateElementOverflow } = this.state

    const welcomeBoxIndex = 1
    const importBoxIndex = 2
    const shieldsBoxIndex = 3
    let lastBoxIndex = shieldsBoxIndex
    const searchBoxIndex = welcomeData.showSearchCard ? ++lastBoxIndex : -1
    const rewardsBoxIndex = welcomeData.showRewardsCard ? ++lastBoxIndex : -1

    const onNext = () => {
      if (this.state.currentScreen === lastBoxIndex) {
        this.onClickDone()
      } else {
        this.onClickNext()
      }
    }

    return (
      <>
        <Page
          id='welcomePage'
          onAnimationEnd={this.resetStyleOverflow}
          shouldUpdateElementOverflow={shouldUpdateElementOverflow}
        >
          <Panel>
            <SlideContent>
              <WelcomeBox index={welcomeBoxIndex} currentScreen={this.currentScreen} onClick={this.onClickLetsGo} />
              <ImportBox
                index={importBoxIndex}
                currentScreen={this.currentScreen}
                onClick={this.onClickImport}
                browserProfiles={welcomeData.browserProfiles}
              />
              <ShieldsBox index={shieldsBoxIndex} currentScreen={this.currentScreen} />
              <SearchBox
                index={searchBoxIndex}
                currentScreen={this.currentScreen}
                onClick={onNext}
                changeDefaultSearchProvider={actions.changeDefaultSearchProvider}
                searchProviders={welcomeData.searchProviders}
              />
              <RewardsBox
                index={rewardsBoxIndex}
                currentScreen={this.currentScreen}
                onClick={this.onClickRewardsGetStarted}
              />
            </SlideContent>
            <FooterBox
              totalScreensSize={lastBoxIndex}
              currentScreen={this.currentScreen}
              onClickSkip={this.onClickSkip}
              onClickSlideBullet={this.onClickSlideBullet}
              onClickNext={onNext}
              onClickDone={this.onClickDone}
            />
          </Panel>
          <BackgroundContainer>
            <Background/>
          </BackgroundContainer>
        </Page>
      </>
    )
  }
}

export const mapStateToProps = (state: Welcome.ApplicationState) => ({
  welcomeData: state.welcomeData
})

export const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(welcomeActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WelcomePage)
