/// Forward step a courier may take. Cancel stays a customer action.
const nextCourierStatus = <String, String>{
  'pending': 'picked_up',
  'picked_up': 'washing',
  'washing': 'done',
  'done': 'delivering',
  'delivering': 'delivered',
};

const proofRequiredStatuses = <String>{'picked_up', 'delivering', 'delivered'};

/// Fase A uses a placeholder URL. Camera upload is out of scope.
const dummyProofPhotoUrl = 'https://example.com/laundry-courier-proof.jpg';

String? forwardStatus(String status) => nextCourierStatus[status];

bool needsProofPhoto(String status) => proofRequiredStatuses.contains(status);

String statusLabel(String status) {
  return switch (status) {
    'pending' => 'Menunggu penjemputan',
    'picked_up' => 'Dijemput',
    'washing' => 'Sedang dicuci',
    'done' => 'Siap diantar',
    'delivering' => 'Sedang diantar',
    'delivered' => 'Terkirim',
    'cancelled' => 'Dibatalkan',
    _ => status,
  };
}

String advanceButtonLabel(String nextStatus) {
  return switch (nextStatus) {
    'picked_up' => 'Tandai dijemput',
    'washing' => 'Mulai cuci',
    'done' => 'Selesai dicuci',
    'delivering' => 'Mulai antar',
    'delivered' => 'Tandai terkirim',
    _ => 'Lanjut status',
  };
}
