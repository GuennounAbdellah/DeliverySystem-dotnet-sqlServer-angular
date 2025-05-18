using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Entities;

namespace Backend.Services
{
    public interface IClientService
    {
        Task<List<Client>> GetAllClients();
        Task<Client> GetClientById(Guid id);
        Task<Client> CreateClient(Client client);
        Task<Client> UpdateClient(Guid id, Client client);
        Task DeleteClient(Guid id);
    }

    public class ClientService : IClientService
    {
        private readonly AppDbContext _context;

        public ClientService(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<List<Client>> GetAllClients()
        {

            return await _context.Clients.ToListAsync();
        }

        public async Task<Client> GetClientById(Guid id)
        {

            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id);

            if (client == null)
                throw new ApplicationException("Client not found.");
                
            return client;
        }

        public async Task<Client> CreateClient(Client client)
        {
            if (string.IsNullOrEmpty(client.Nom))
                throw new ApplicationException("Client name is required.");
            
            var existingClient = await _context.Clients
                .FirstOrDefaultAsync(c => c.Nom == client.Nom && c.Telephone == client.Telephone);
            if (existingClient != null)
                throw new ApplicationException("Client with the same name and phone number already exists.");

            client.Id = Guid.NewGuid();
            
            _context.Clients.Add(client);
            
            await _context.SaveChangesAsync();

            return await GetClientById(client.Id);
        }

        public async Task<Client> UpdateClient(Guid id, Client updatedClient)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id);
            if (client == null)
                throw new ApplicationException("Client not found.");

            if (!string.IsNullOrEmpty(updatedClient.Nom))
                client.Nom = updatedClient.Nom;
            if (!string.IsNullOrEmpty(updatedClient.Telephone))
                client.Telephone = updatedClient.Telephone;
            if (!string.IsNullOrEmpty(updatedClient.Adresse))
                client.Adresse = updatedClient.Adresse;
            if (!string.IsNullOrEmpty(updatedClient.Fax))
                client.Fax = updatedClient.Fax;

            await _context.SaveChangesAsync();
            
            return client;
        }

        public async Task DeleteClient(Guid id)
        {

            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                throw new ApplicationException("Client not found.");

            var isReferenced = await _context.Livraisons.AnyAsync(l => l.ClientId == id);
            if (isReferenced)
                throw new ApplicationException("Cannot delete client because they are associated with deliveries.");

            _context.Clients.Remove(client);
            
            await _context.SaveChangesAsync();
        }
    }
}