import { Ticket } from "../ticketsModel";

it('implement version control', async() => {
    const ticket = Ticket.build({
        title: 'nba',
        price: 200,
        userId: '123'
    })

    await ticket.save()

    const firstInstance = await Ticket.findById(ticket.id)
    const secondInstance = await Ticket.findById(ticket.id)

    firstInstance!.set({ price: 300 })
    secondInstance!.set({ price: 100 })

    await firstInstance!.save()
    
    try {
        await secondInstance!.save();
      } catch (err) {
        return;
      }

      throw new Error('Should not reach this point')
})

it('increments the version number on multiples saves', async() => {
    const ticket = Ticket.build({
        title: 'nba',
        price: 200,
        userId: '123'
    })
    
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1)
    await ticket.save();
    expect(ticket.version).toEqual(2)
})