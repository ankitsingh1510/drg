import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

const NetworkChecker = () => {
  const alertShownRef = useRef(false);

  const maybeAlert = (state: NetInfoState) => {
    const noConnection =
      state.isConnected === false ||
      state.isInternetReachable === false ||
      state.type === 'unknown' ||
      state.type === 'none';

    if (noConnection && !alertShownRef.current) {
      alertShownRef.current = true;
      Alert.alert('No Internet', 'An internet connection is required to use the app.', [{ text: 'OK' }], {
        cancelable: false,
      });
      setTimeout(() => {
        alertShownRef.current = false;
      }, 3000);
    }
  };

  useEffect(() => {
    NetInfo.fetch().then(maybeAlert);

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isInternetReachable === null || state.isInternetReachable === undefined) {
        NetInfo.fetch().then(maybeAlert);
      } else {
        maybeAlert(state);
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
};

export default NetworkChecker;
