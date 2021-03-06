import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Platform,
	StyleSheet
} from 'react-native';
import {
	getMetricMetaInfo,
	timeToString,
	getDailyReminderValue
} from '../utils/helpers';
import { MySlider } from './MySlider';
import { Stepper } from './Stepper';
import { DateHeader } from './DateHeader';
import { Ionicons } from '@expo/vector-icons';
import { TextButton } from './TextButton';
import { submitEntry, removeEntry } from '../utils/api';
import { connect } from 'react-redux';
import { addEntry } from '../actions';
import { white, purple } from '../utils/colors';
import { NavigationActions } from 'react-navigation';

const SubmitButton = ({ onPress }) => {
	return (
		<TouchableOpacity
			style={
				Platform.OS === 'ios'
					? styles.iosSubmitBtn
					: styles.androidSubmitBtn
			}
			onPress={onPress}
		>
			<Text style={styles.submitBtnText}>Submit</Text>
		</TouchableOpacity>
	);
};

class AddEntry extends Component {
	state = {
		run: 0,
		bike: 0,
		swim: 0,
		sleep: 0,
		eat: 0
	};
	increment = metric => {
		const { max, step } = getMetricMetaInfo(metric);
		this.setState(state => {
			const count = state[metric] + step;
			return {
				...state,
				[metric]: count > max ? max : count
			};
		});
	};
	decrement = metric => {
		this.setState(state => {
			const count = state[metric] - getMetricMetaInfo(metric).step;
			return {
				...state,
				[metric]: count < 0 ? 0 : count
			};
		});
	};
	slide = (metric, value) => {
		this.setState(() => ({
			[metric]: value
		}));
	};
	submit = () => {
		const key = timeToString();
		const entry = this.state;

		this.props.dispatch(
			addEntry({
				[key]: entry
			})
		);

		this.setState(() => ({
			run: 0,
			bike: 0,
			swim: 0,
			sleep: 0,
			eat: 0
		}));

		this.toHome();

		submitEntry({ key, entry });
		//clear loca notification
	};
	reset = () => {
		const key = timeToString();
		this.props.dispatch(
			addEntry({
				[key]: getDailyReminderValue()
			})
		);
		this.toHome();
		removeEntry(key);
	};
	toHome = () => {
		this.props.navigation.dispatch(
			NavigationActions.back({
				key: 'AddEntry'
			})
		);
	};
	render() {
		const metaInfo = getMetricMetaInfo();
		if (this.props.alreadyLogged) {
			return (
				<View style={styles.center}>
					<Ionicons name={'md-happy'} size={100} />
					<Text> Your Aready Logged Your Information For Today</Text>
					<TextButton style={{ padding: 10 }} onPress={this.reset}>
						Reset
					</TextButton>
				</View>
			);
		}
		return (
			<View style={styles.container}>
				<DateHeader date={new Date().toLocaleDateString()} />
				{Object.keys(metaInfo).map(key => {
					const { getIcon, type, ...rest } = metaInfo[key];
					const value = this.state[key];
					return (
						<View key={key} style={styles.row}>
							{getIcon()}
							{type === 'slider' ? (
								<MySlider
									value={value}
									onChange={value => this.slide(key, value)}
									{...rest}
								/>
							) : (
								<Stepper
									value={value}
									onIncrement={() => this.increment(key)}
									onDecrement={() => this.decrement(key)}
									{...rest}
								/>
							)}
						</View>
					);
				})}
				<SubmitButton onPress={this.submit} />
			</View>
		);
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: white
	},
	iosSubmitBtn: {
		backgroundColor: purple,
		padding: 10,
		borderRadius: 7,
		height: 45,
		marginRight: 40,
		marginLeft: 40
	},
	androidSubmitBtn: {
		backgroundColor: purple,
		padding: 10,
		paddingLeft: 30,
		paddingRight: 30,
		borderRadius: 2,
		height: 45,
		alignSelf: 'flex-end',
		justifyContent: 'center',
		alignContent: 'center'
	},
	submitBtnText: {
		color: white,
		fontSize: 22,
		textAlign: 'center'
	},
	row: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center'
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 30,
		marginLeft: 30
	}
});
function mapStateToProps(state) {
	const key = timeToString();
	return {
		alreadyLogged: state[key] && typeof state[key].today === 'undefined'
	};
}

export default connect(mapStateToProps)(AddEntry);
