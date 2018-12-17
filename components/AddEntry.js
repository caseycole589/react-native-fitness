import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getMetricMetaInfo, timeToString } from '../utils/helpers';
import { MySlider } from './MySlider';
import { Stepper } from './Stepper';
import { DateHeader } from './DateHeader';
import { Ionicons } from '@expo/vector-icons';
import { TextButton } from './TextButton';
const SubmitButton = ({ onPress }) => {
	return (
		<TouchableOpacity onPress={onPress}>
			<Text>Submit</Text>
		</TouchableOpacity>
	);
};

export default class AddEntry extends Component {
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
		this.setState(() => ({
			run: 0,
			bike: 0,
			swim: 0,
			sleep: 0,
			eat: 0
		}));
		//update redux
		//navigate home
		//save to database
		//clear loca notification
	};
	reset = () => {
		const key = timeToString();
		//updateredux
		//go home
		//update database
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
				<SubmitButton onPress={this.submit} />
			</View>
		);
	}
}
