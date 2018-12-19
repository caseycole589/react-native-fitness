import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
const SubmitButton = ({ onPress }) => {
	return (
		<TouchableOpacity onPress={onPress}>
			<Text>Submit</Text>
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
		//update redux
		//navigate home
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
		//go home
		removeEntry(key);
	};
	render() {
		const metaInfo = getMetricMetaInfo();
		if (this.props.alreadyLogged) {
			return (
				<View>
					<Ionicons name="ios-happy" size={100} />
					<Text> Your Aready Logged Your Information For Today</Text>
					<TextButton onPress={this.reset}>Reset</TextButton>
				</View>
			);
		}
		return (
			<View>
				<DateHeader date={new Date().toLocaleDateString()} />
				<SubmitButton onPress={this.submit} />
				{Object.keys(metaInfo).map(key => {
					const { getIcon, type, ...rest } = metaInfo[key];
					const value = this.state[key];
					return (
						<View key={key}>
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
			</View>
		);
	}
}
function mapStateToProps(state) {
	const key = timeToString();
	return {
		alreadyLogged: state[key] && typeof state[key].today === 'undefined'
	};
}

export default connect(mapStateToProps)(AddEntry);
