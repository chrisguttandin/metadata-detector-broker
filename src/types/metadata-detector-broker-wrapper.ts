import { IDefaultBrokerDefinition } from 'broker-factory';
import { IMetadataDetectorBrokerDefinition } from '../interfaces';

export type TMetadataDetectorBrokerWrapper = (sender: MessagePort | Worker) => IMetadataDetectorBrokerDefinition & IDefaultBrokerDefinition;
