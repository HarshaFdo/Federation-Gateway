import { Logger, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose } from '@apollo/gateway';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: 'vehicles', url: 'http://localhost:3003/graphql' },
            { name: 'records', url: 'http://localhost:3001/graphql' },
          ],
        }),
        debug: true,
      },
      server: {
        plugins: [
          {
            // run every time a new grapghQL request hit the gateway
            async requestDidStart(requestContext) {
              const logger = new Logger('ApolloGateway');
              const operationName =
                requestContext.request.operationName || 'Anonymous';

              logger.log('Gateway: Received request');
              logger.log(`Operation: ${operationName}`);

              return {
                // Run right before the gateway sends the reponse back
                async willSendResponse() {
                  logger.log(
                    `Gateway: Sending response for operation ${operationName}`,
                  );
                },
              };
            },
          },
        ],
      },
    }),
  ],
})
export class AppModule {}
