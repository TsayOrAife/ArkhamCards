import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import { bindActionCreators, Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { t } from 'ttag';

import PackListComponent from '@components/core/PackListComponent';
import { NavigationProps } from '@components/nav/types';
import { Pack } from '@actions/types';
import { setInCollection, setCycleInCollection } from '@actions';
import { getAllPacks, getPacksInCollection, AppState } from '@reducers';
import StyleContext, { StyleContextType } from '@styles/StyleContext';
import Database from '@data/Database';
import DatabaseContext, { DatabaseContextType } from '@data/DatabaseContext';

interface ReduxProps {
  packs: Pack[];
  in_collection: { [pack_code: string]: boolean };
}

interface ReduxActionProps {
  setInCollection: (code: string, value: boolean, db: Database) => void;
  setCycleInCollection: (cycle_code: string, value: boolean, db: Database) => void;
}
type Props = NavigationProps & ReduxProps & ReduxActionProps;

class CollectionEditView extends React.Component<Props> {
  static contextType = DatabaseContext;
  context!: DatabaseContextType;

  static options() {
    return {
      topBar: {
        title: {
          text: t`Edit Collection`,
        },
      },
    };
  }

  _setInCollection = (code: string, value: boolean) => {
    const { setInCollection } = this.props;
    const { db } = this.context;
    setInCollection(code, value, db);
  };

  _setCycleInCollection = (cycle_code: string, value: boolean) => {
    const { setCycleInCollection } = this.props;
    const { db } = this.context;
    setCycleInCollection(cycle_code, value, db);
  };

  render() {
    const {
      componentId,
      packs,
      in_collection,
    } = this.props;
    return (
      <StyleContext.Consumer>
        { ({ typography }) => {
          if (!packs.length) {
            return (
              <View>
                <Text style={typography.text}>{t`Loading`}</Text>
              </View>
            );
          }
          return (
            <PackListComponent
              coreSetName={t`Second Core Set`}
              componentId={componentId}
              packs={packs}
              checkState={in_collection}
              setChecked={this._setInCollection}
              setCycleChecked={this._setCycleInCollection}
            />
          );
        } }
      </StyleContext.Consumer>
    )
  }
}

function mapStateToProps(state: AppState) {
  return {
    packs: getAllPacks(state),
    in_collection: getPacksInCollection(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<Action>) {
  return bindActionCreators({
    setInCollection,
    setCycleInCollection,
  }, dispatch);
}

export default connect<ReduxProps, ReduxActionProps, NavigationProps, AppState>(
  mapStateToProps,
  mapDispatchToProps
)(CollectionEditView);
