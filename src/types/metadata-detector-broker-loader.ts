import { IDefaultBrokerDefinition } from 'broker-factory';
import { IMetadataDetectorBrokerDefinition } from '../interfaces';

export type TMetadataDetectorBrokerLoader = (url: string) => IMetadataDetectorBrokerDefinition & IDefaultBrokerDefinition;
