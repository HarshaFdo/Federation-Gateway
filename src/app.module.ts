import { Module } from '@nestjs/common';
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
            async requestDidStart(requestContext) {
              const operationName =
                requestContext.request.operationName || 'Anonymous';

              console.log('Gateway: Received request');
              console.log(`Operation: ${operationName}`);

              return {
                async willSendResponse() {
                  console.log(
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
