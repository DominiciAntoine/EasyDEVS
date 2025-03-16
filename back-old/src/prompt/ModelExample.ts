const modelExample: string = `
{
    from DomainInterface.DomainBehavior import DomainBehavior
    from DomainInterface.Object import Message

    class ModelName(DomainBehavior):
        ''' DEVS Class for a generic model '''

        def __init__(self, param1=10, param2="default"):
            ''' Constructor '''
            DomainBehavior.__init__(self)
            self.param1 = param1
            self.param2 = param2
            # Initialize any other required attributes
            self.initPhase('INITIAL_STATE', INFINITY)  # Customizable initial state and duration

        def extTransition(self, *args):
            ''' DEVS external transition function (only for models that receive data) '''
            for port in self.IPorts:
                msg = self.peek(port, *args)
                if msg:
                    # State change or action logic based on the message
                    current_state = self.getState()  # Example usage of getState()
                    pass  # Customize based on intended behavior

        def outputFnc(self):
            ''' DEVS output function (only for models that send data) '''
            # Create and return a structured message for output ports
            return self.poke(self.OPorts[0], Message("Message content", self.timeNext))

        def intTransition(self):
            ''' DEVS internal transition function '''
            current_state = self.getState()  # Example usage of getState()
            # Use self.holdIn() to change state or set an internal delay
            pass  # Customize as needed

        def timeAdvance(self):
            ''' DEVS Time Advance function '''
            return self.getSigma()
    "
}
`;

export { modelExample };
